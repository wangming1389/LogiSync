param(
	[string]$EnvFile = "",
	[string]$PrimaryContainer = "logisync-db",
	[string]$ReplicaContainer = "logisync-db-replica",
	[string]$PublicationName = "logisync_audit_logs_pub",
	[string]$SubscriptionName = "logisync_audit_logs_sub"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir/../.."

if (-not $EnvFile) {
	$EnvFile = Join-Path $ProjectRoot ".env"
}

function Read-DotEnv($Path) {
	if (-not (Test-Path $Path)) {
		throw "Env file not found: $Path"
	}

	$values = @{}
	Get-Content $Path | ForEach-Object {
		$line = $_.Trim()
		if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
			return
		}

		$key, $value = $line -split "=", 2
		$values[$key.Trim()] = $value.Trim().Trim('"')
	}

	return $values
}

function Exec-Psql($Container, $User, $Database, $Sql) {
	$Sql | docker exec -i `
		-e "PGPASSWORD=$($script:Env.POSTGRES_PASSWORD)" `
		$Container `
		psql -v ON_ERROR_STOP=1 -U $User -d $Database
}

$script:Env = Read-DotEnv $EnvFile
$user = $script:Env.POSTGRES_USER
$password = $script:Env.POSTGRES_PASSWORD
$database = $script:Env.POSTGRES_DB

if (-not $user -or -not $password -or -not $database) {
	throw "POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are required in $EnvFile"
}

$primaryConn = "host=postgres port=5432 dbname=$database user=$user password=$password"

Write-Host "Checking primary wal_level..."
$walLevel = docker exec -e "PGPASSWORD=$password" $PrimaryContainer `
	psql -At -U $user -d $database -c "show wal_level;"

if ($walLevel -ne "logical") {
	throw "Primary wal_level is '$walLevel'. Run: docker compose up -d --force-recreate postgres"
}

Write-Host "Creating audit_logs table on replica if missing..."
Exec-Psql $ReplicaContainer $user $database @"
CREATE TABLE IF NOT EXISTS public.audit_logs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	actor_id uuid NOT NULL,
	workspace_id uuid NOT NULL,
	action varchar(255) NOT NULL,
	resource_type varchar(100) NOT NULL,
	resource_id uuid,
	changes jsonb,
	ip_address varchar(45) NOT NULL,
	user_agent text,
	status varchar(50) NOT NULL,
	error_message text,
	timestamp timestamp(6) with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx
	ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx
	ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_workspace_id_idx
	ON public.audit_logs (workspace_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx
	ON public.audit_logs (action);
"@

Write-Host "Creating publication on primary for public.audit_logs..."
Exec-Psql $PrimaryContainer $user $database @"
DROP PUBLICATION IF EXISTS $PublicationName;
CREATE PUBLICATION $PublicationName FOR TABLE public.audit_logs;
"@

Write-Host "Resetting subscription on replica and copying existing audit logs..."
Exec-Psql $ReplicaContainer $user $database @"
DROP SUBSCRIPTION IF EXISTS $SubscriptionName;
TRUNCATE TABLE public.audit_logs;
CREATE SUBSCRIPTION $SubscriptionName
	CONNECTION '$primaryConn'
	PUBLICATION $PublicationName
	WITH (copy_data = true);
"@

Write-Host "Audit log logical replication is configured."
Write-Host "Check status with:"
Write-Host "docker exec -it $ReplicaContainer psql -U $user -d $database -c `"select * from pg_stat_subscription;`""
