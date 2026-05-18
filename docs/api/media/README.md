# Media Module (Infrastructure & Storage)

## 1. Overview
The Media module provides secure file storage and delivery services for the entire platform. It handles document uploads (ID cards, legal docs, e-PODs) and ensures that sensitive media is never exposed via public URLs.

## 2. Implemented Features & Mapping

### 2.1 Storage & Delivery
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Upload File** | UC88 | BR-04 (Size Limits) | Implemented (Direct to Object Storage) |
| **Generate Signed URL** | UC89 | ADD QAR-17 | Implemented (1h TTL, Private Access) |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-MED-01** | File Size Enforcement | BR-04 | Reject uploads > 5MB for images / 10MB for documents. |
| **TC-MED-02** | File Format Validation | BR-537 / BR-04 | Only allow .pdf, .jpg, .png for legal documents. |
| **TC-MED-03** | Audit Log (Signed URL) | BR-547 | Every request to generate a signed URL must be logged. |

### 3.2 Architectural & Security Test Cases (ADD/SAD Mapping)
| ID | Test Scenario | ADD/SAD Reference | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-MED-04** | Private Bucket Policy | ADD 1.3 | Direct public access to storage bucket returns 403 Forbidden. |
| **TC-MED-05** | Signed URL Expiration | ADD QAR-17 | Generated URLs must expire exactly after 1 hour. |
| **TC-MED-06** | JIT Generation Overhead | ADD 2.3.3 | Signed URL generation adds < 200ms to API response. |

## 4. Technical Constraints
- **Backend**: MinIO / AWS S3 compatible object storage.
- **Security**: Bucket-level policies block all public read access.
- **UX**: JIT (Just-In-Time) conversion of internal paths to Signed URLs during API serialization.
