# Rate Limit Testing Guide

This document outlines the testing strategy and coverage for the `RateLimitGuard` implemented in the `core/security` module. The Rate Limiting mechanism is crucial for protecting the API from brute-force attacks and abuse.

## Overview

The `RateLimitGuard` (`src/core/security/rate-limit.guard.ts`) uses an in-memory or Redis-backed sliding window mechanism (depending on configuration) to limit the number of requests a client can make within a specified time window. The limits are defined using the `@RateLimit` decorator.

## Test Cases Covered

The test cases are located in `src/core/security/rate-limit.guard.spec.ts`. The current unit tests validate the following core behaviors:

### 1. Routes Without Rate Limits
- **Scenario:** A request is made to a route that does not have the `@RateLimit` decorator.
- **Expected Behavior:** The guard should always allow the request (`canActivate` returns `true`).

### 2. IP-Based Rate Limiting (Public Routes)
- **Scenario:** A public endpoint is configured to limit requests by IP (`keyBy: 'ip'`). For example, an authentication login route.
- **Expected Behavior:** The guard should allow requests up to the defined limit. Once the limit is exceeded within the `windowMs`, it should throw an `HttpException` (Status 429 Too Many Requests).

### 3. User-Based Rate Limiting (Authenticated Routes)
- **Scenario:** An authenticated endpoint is configured to limit requests per user (`keyBy: 'user'`).
- **Expected Behavior:** The guard should track buckets separately for each user (based on `user.sub` or `user.id`). One user hitting their limit should not affect another user's ability to make requests.

### 4. Missing User Context for User-Scoped Policies
- **Scenario:** A request is made to an endpoint with `keyBy: 'user'`, but the request does not contain an authenticated user context (i.e., public request on a protected-like rate limit policy).
- **Expected Behavior:** The guard should immediately reject the request and throw an `HttpException` because it cannot uniquely identify the request bucket.

## How to Run the Tests

To execute the rate-limit guard test cases, run the following command from the `apps/api` directory:

```bash
npm run test -- src/core/security/rate-limit.guard.spec.ts
```

## Future Testing Considerations

As the system evolves, consider adding the following integration test scenarios:
- **Redis Integration:** Verify that rate limits correctly persist and synchronize across multiple instances when using a Redis store.
- **Header Injection:** Verify that the `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers are correctly injected into the HTTP response.
