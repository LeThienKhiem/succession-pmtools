export const DEFAULT_BRAIN = `# Dự án SuccessionOS

## Tổng quan
Hệ thống quản lý kế thừa nhân sự (Succession Planning SaaS) cho doanh nghiệp.
Deadline: BOD Demo Day cuối tháng 5/2026.

## Epics
- E01: Nền tảng & Auth — DB schema, login, SSO, audit_logs, tenant, roles
- E02: Dashboard & Nhân Tài — danh sách nhân viên, talent map, data visibility, matrix hiển thị
- E03: Vị Trí & Kế Thừa — position management, succession map, org chart
- E04: Assessment & 9-Box — đánh giá nhân sự, 9-box matrix, scoring
- E05: IDP & Phê duyệt — Individual Development Plan, approval workflow, notifications
- E06: AI & Báo cáo — AI insights, executive reports, export PDF/Excel

## Sprints
- Sprint 1 (20/4 – 25/4): Nền tảng & Dashboard
- Sprint 2 (26/4 – 2/5): Vị Trí & Bản Đồ Kế Thừa
- Sprint 3 (3/5 – 9/5): Assessment & 9-Box
- Sprint 4 (10/5 – 19/5): IDP & Phê duyệt
- Sprint 5 (20/5 – 31/5): AI & Báo cáo

## Nhân sự
- lk (Lê Khiêm): Project Manager — quản lý dự án, timeline
- tl (Lê Duy): Tech Lead — quyết định kỹ thuật, review code
- ba1 (Tiến): Business Analyst — spec E01, E02, E03
- ba2 (Ngân): Business Analyst — spec E04, E05, E06
- ds (Đăng): Designer Senior — design system, UX flows
- dj (Hương): Designer Junior — UI screens, assets
- dev: Developer — implementation, unit test

## Quy ước trạng thái
- "done": code merged + BA confirm, hoặc design approved bởi PM
- "in-progress": đang thực hiện, có commit hoặc file đang làm
- "blocked": chờ dependency, chờ feedback, hoặc có issue cần giải quyết
- "todo": chưa bắt đầu`
