import SourcingDashboardClient from './components/SourcingDashboardClient';

// Server Component shell for the buyer sourcing dashboard.
// All interactive logic lives inside `SourcingDashboardClient`.
// Future refactors will move individual tabs (search, RFQs,
// comparison) into smaller client components that consume the
// React Query hooks in `services/queries/useSourcingQueries.ts`.
export default function BuyerSourcingPage() {
	return <SourcingDashboardClient />;
}
