# Health Checks & Monitoring

## 1. Overview
The Health Check system monitors the availability of critical and non-critical infrastructure components. It provides real-time status updates via API and triggers automated alerts when degradation is detected.

## 2. Monitored Services
- **Database (PostgreSQL)**: Mandatory. If down, the application is considered `UNHEALTHY`.
- **Redis (Session Registry)**: Degraded. Used for sessions and lockout.
- **Object Storage (MinIO)**: Degraded. Used for media storage.
- **Message Queue (RabbitMQ)**: Degraded. Used for notifications and background events.

## 3. Endpoints
- **`/health`**: Returns full status of all services.
- **`/health/live`**: Liveness probe for Kubernetes/Docker (returns 200 if app is up).
- **`/health/ready`**: Readiness probe (returns 200 ONLY if Database is connected).

## 4. Automated Alerts
Located at `apps/api/src/core/health/health-check.service.ts`.
- **Interval**: Checks are performed every 15 seconds.
- **Timeout**: Each service ping has a 3-second timeout.
- **Email Alerts**: Triggered via SMTP if any service fails. Includes a 2-minute cooldown to prevent spamming.

## 5. Test Cases Mapping

### 5.1 Infrastructure Test Cases
| ID | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-HLT-01** | Database Outage | `/health/ready` must return 503 Service Unavailable. |
| **TC-HLT-02** | Redis Degraded | `/health` returns `degraded: true`, but `/health/ready` still returns 200. |
| **TC-HLT-03** | Alert Trigger | Killing MinIO service should trigger an email alert within 15-30 seconds. |
| **TC-HLT-04** | Alert Cooldown | Repeated failures within 2 minutes must NOT send duplicate emails. |
| **TC-HLT-05** | Check Execution | Registry runs registered health checks correctly. |
| **TC-HLT-06** | Optional Check Failure | Registry returns failed optional checks without throwing. |

## 6. Technical Constraints
- **Reliability**: Alert emails are sent directly (bypassing the message queue) to ensure delivery even if RabbitMQ is down.
- **Performance**: Health checks are performed in the background and cached to ensure `/health` endpoint response time is < 50ms.
