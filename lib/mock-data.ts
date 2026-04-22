// Static mock data — sourced from SuccessionOS_Sprint_v2.xlsx
// 77 tasks, 6 epics, 5 sprints

export const PROJECT = {
  id: 'proj-001',
  name: 'Dự án Kế nhiệm (Succession Planning)',
  description: 'Xây dựng SuccessionOS — Succession Planning SaaS cho doanh nghiệp.',
  start_date: '2026-04-20',
  end_date: '2026-05-31',
  status: 'active' as const,
  progress_percent: 45,
}

export const GOALS = [
  'Xây dựng hệ thống quản lý kế nhiệm cho doanh nghiệp',
  'Thiết kế quy trình đánh giá, lựa chọn và phát triển nhân sự kế cận',
  'Chuẩn hóa dữ liệu, mô hình năng lực và lộ trình phát triển',
]

export const MILESTONES = [
  { id: 'ms-1', order: 1, date: '2026-04-20', title: 'Khởi động Dự án (Kick-off)',        description: 'Chốt đội ngũ và thống nhất quy trình làm việc.',                          is_done: true },
  { id: 'ms-2', order: 2, date: '2026-04-24', title: 'Foundation & Dashboard deployed',   description: 'Auth + CRUD nhân viên + Dashboard KPI + audit trail.',                     is_done: true },
  { id: 'ms-3', order: 3, date: '2026-05-09', title: 'Vị Trí & Bản Đồ Kế Thừa xong',    description: 'Succession Map, 9-Box, Assessment Engine, AI Backfill.',                   is_done: true },
  { id: 'ms-4', order: 4, date: '2026-05-16', title: 'Staging frozen — UAT 18/05',        description: 'Real API toàn bộ, 25 nhân viên thật, zero P1 bugs.',                       is_done: false },
  { id: 'ms-5', order: 5, date: '2026-05-23', title: 'IDP + Approval + Fix UAT xong',     description: 'IDP 3-cấp, Workflow Engine 8 cấp, Gatekeeping, Mentoring.',                is_done: false },
  { id: 'ms-6', order: 6, date: '2026-05-30', title: 'Staging frozen — BOD Demo ready',   description: 'AI Career Path, Kirkpatrick, demo rehearsal 2x, zero critical.',            is_done: false },
  { id: 'ms-7', order: 7, date: '2026-05-31', title: 'BOD Demo Day',                      description: 'Demo toàn bộ hệ thống cho Ban Giám đốc.',                                  is_done: false },
]

export interface TeamMember {
  id: string
  code: string
  name: string
  role: string
  color: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-01', code: 'lk',  name: 'Lê Khiêm',  role: 'Project Manager',  color: '#1D9E75' },
  { id: 'tm-02', code: 'tl',  name: 'Lê Duy',    role: 'Tech Lead',        color: '#BA7517' },
  { id: 'tm-03', code: 'ba1', name: 'Tiến',       role: 'Business Analyst', color: '#378ADD' },
  { id: 'tm-04', code: 'ba2', name: 'Ngân',       role: 'Business Analyst', color: '#639922' },
  { id: 'tm-05', code: 'ds',  name: 'Đăng',       role: 'Designer Senior',  color: '#7F77DD' },
  { id: 'tm-06', code: 'dj',  name: 'Hương',      role: 'Designer Junior',  color: '#9B59B6' },
]

export const EPICS = [
  { id: 'ep-01', code: 'E01', name: 'Nền tảng & Auth',           sprint_id: 'sp-1', color: '#4F46E5' },
  { id: 'ep-02', code: 'E02', name: 'Dashboard & Nhân Tài',       sprint_id: 'sp-1', color: '#0EA5E9' },
  { id: 'ep-03', code: 'E03', name: 'HRM360 & Kế Thừa',          sprint_id: 'sp-2', color: '#10B981' },
  { id: 'ep-04', code: 'E04', name: 'IDP & Phê duyệt',           sprint_id: 'sp-3', color: '#F59E0B' },
  { id: 'ep-05', code: 'E05', name: 'UI Integration',             sprint_id: 'sp-2', color: '#8B5CF6' },
  { id: 'ep-06', code: 'E06', name: 'AI & Báo cáo',              sprint_id: 'sp-5', color: '#EC4899' },
  { id: 'ep-08', code: 'E08', name: 'UAT & Staging',             sprint_id: 'sp-3', color: '#F43F5E' },
]

export type SprintStatus = 'upcoming' | 'active' | 'completed' | 'outline'
export type TaskStatus   = 'todo' | 'in-progress' | 'done' | 'blocked' | 'outline'
export type TaskType     = 'spec' | 'story' | 'design' | 'dev' | 'test' | 'review' | 'doc'
export type TaskPriority = 'critical' | 'priority' | 'normal' | 'high' | 'medium' | 'low'

export interface Task {
  id: string
  sprint_id: string
  epic_id?: string
  epic_code: string
  title: string
  description?: string
  assignee_id?: string
  assignee_code: string
  day_label: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  estimated_hours?: number
  documents?: string[]
  sort_order?: number
}

export const SPRINTS = [
  {
    id: 'sp-1', name: 'Sprint 1', theme: 'Nền tảng & Dashboard',
    start_date: '2026-04-20', end_date: '2026-04-24',
    status: 'completed' as SprintStatus, progress_percent: 71,
    epics: ['E01 · Nền tảng & Auth', 'E02 · Dashboard & Nhân Tài'],
  },
  {
    id: 'sp-2', name: 'Sprint 2', theme: 'HRM360 Import + 9-Box + Succession',
    start_date: '2026-05-05', end_date: '2026-05-09',
    status: 'completed' as SprintStatus, progress_percent: 52,
    epics: ['E03 · HRM360 & Kế Thừa', 'E02 · Dashboard & Nhân Tài', 'E05 · UI Integration'],
  },
  {
    id: 'sp-3', name: 'Sprint 3', theme: 'UI Integration + IDP + Staging',
    start_date: '2026-05-12', end_date: '2026-05-16',
    status: 'active' as SprintStatus, progress_percent: 64,
    epics: ['E04 · IDP & Phê duyệt', 'E05 · UI Integration', 'E08 · UAT & Staging'],
  },
  {
    id: 'sp-4', name: 'Sprint 4', theme: 'Fix UAT & IDP & Approval',
    start_date: '2026-05-19', end_date: '2026-05-23',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E05 · IDP & Phê duyệt'],
  },
  {
    id: 'sp-5', name: 'Sprint 5', theme: 'AI & Kirkpatrick & BOD Demo',
    start_date: '2026-05-26', end_date: '2026-05-30',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E06 · AI & Báo cáo'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 77 TASKS — SuccessionOS_Sprint_v2.xlsx
// sort_order: index within sprint (used for card reordering)
// ─────────────────────────────────────────────────────────────────────────────
export const TASKS: Task[] = [

  // ══ SPRINT 1 — Nền tảng & Dashboard (21 tasks) ═══════════════════════════
  { id:'s1-01', sprint_id:'sp-1', epic_code:'E01', sort_order:1,  assignee_code:'ba1', day_label:'T2 20/4',      type:'spec',   status:'done', priority:'critical', title:'Spec schema DB: 8 bảng chính + tenant + RLS',                              description:'Thiết kế đầy đủ: employees, positions, assessment_cycles, scores, risk_factors, certifications, audit_logs, role_permissions. Kiểu dữ liệu, FK, indexes, RLS policy per tenant. Xác nhận với Tech Lead trước migrate.' },
  { id:'s1-02', sprint_id:'sp-1', epic_code:'E01', sort_order:2,  assignee_code:'ba1', day_label:'T2 20/4',      type:'spec',   status:'done', priority:'critical', title:'Spec audit_logs: trigger mọi bảng nhạy cảm',                               description:'Bảng ghi: table_name, record_id, actor, timestamp, action, old_val/new_val (jsonb), reason. Trigger INSERT/UPDATE/DELETE tự động. Bắt buộc theo Điều 7.' },
  { id:'s1-03', sprint_id:'sp-1', epic_code:'E02', sort_order:3,  assignee_code:'ba1', day_label:'T3 21/4',      type:'spec',   status:'done',        priority:'critical', title:'Spec ma trận hiển thị trường theo vai trò',                                description:'Quyết định từng field: HR Admin thấy lương số thực, Manager thấy gap%, Employee ẩn. Áp dụng RLS + middleware. Đây là nền tảng cho tính năng Nhân Tài.' },
  { id:'s1-04', sprint_id:'sp-1', epic_code:'E02', sort_order:4,  assignee_code:'ba1', day_label:'T3 21/4',      type:'spec',   status:'done',        priority:'critical', title:'Spec data consent hard-stop',                                               description:'Checkbox bắt buộc trước mọi form submit. Nút Gửi disabled đến khi tick. Lưu timestamp + user_id vào audit_log. Áp dụng cho IDP, Assessment, CRUD nhân viên.' },
  { id:'s1-05', sprint_id:'sp-1', epic_code:'E02', sort_order:5,  assignee_code:'ba1', day_label:'T4 22/4',      type:'spec',   status:'done',        priority:'normal',   title:'Spec import Excel/CSV: mapping cột + báo lỗi từng dòng',                  description:'Pipeline: upload → auto-detect cột → validate → báo lỗi từng dòng (số dòng + trường + message) → partial import với xác nhận. Format xlsx/csv.' },
  { id:'s1-06', sprint_id:'sp-1', epic_code:'E02', sort_order:6,  assignee_code:'ba1', day_label:'T5-T6 23-24/4',type:'spec',   status:'done',        priority:'critical', title:'Spec Dashboard: 4 KPI cards + alert list + navigation',                    description:'4 KPI: vị trí thiếu kế thừa, nhân tài rủi ro, IDP chờ duyệt, cert sắp hết hạn. Alert list cho từng KPI. Nav từ Dashboard → trang chi tiết. Mobile responsive.' },
  { id:'s1-07', sprint_id:'sp-1', epic_code:'E01', sort_order:7,  assignee_code:'ba2', day_label:'T2 20/4',      type:'story',  status:'done',        priority:'critical', title:'User story: Auth flows (login, SSO, redirect theo vai trò)',               description:'Story cho: login email/password, SSO (LDAP của PTSC M&C), forgot password, redirect đúng trang theo role. AC: sai password, tài khoản khóa, session hết hạn.' },
  { id:'s1-08', sprint_id:'sp-1', epic_code:'E02', sort_order:8,  assignee_code:'ba2', day_label:'T3 21/4',      type:'story',  status:'done',        priority:'normal',   title:'User story: CRUD nhân viên + import file',                                 description:'Story cho: thêm/sửa/xóa nhân viên, import Excel/CSV, hiển thị lỗi từng dòng. AC: email trùng, thiếu trường bắt buộc, sai định dạng ngày.' },
  { id:'s1-09', sprint_id:'sp-1', epic_code:'E01', sort_order:9,  assignee_code:'ba2', day_label:'T4 22/4',      type:'test',   status:'todo',        priority:'critical', title:'Test case: Auth + LDAP + phân quyền vai trò',                              description:'Test: login thành công/thất bại, SSO, LDAP PTSC M&C, redirect theo role, session expiry, logout. Quyền: HR Admin/Manager/Employee thấy menu gì.' },
  { id:'s1-10', sprint_id:'sp-1', epic_code:'E02', sort_order:10, assignee_code:'ba2', day_label:'T5 23/4',      type:'test',   status:'todo',        priority:'critical', title:'Test case: CRUD nhân viên + import + hiển thị trường theo vai trò',        description:'CRUD: create (success, duplicate, missing), read (filter/sort), update (partial, salary per role), soft delete. Import: valid file, mixed errors, empty file.' },
  { id:'s1-11', sprint_id:'sp-1', epic_code:'E01', sort_order:11, assignee_code:'ds',  day_label:'T2 20/4',      type:'design', status:'done',        priority:'critical', title:'Design: Login production + SSO + 3 landing pages theo vai trò',            description:'Trang login: logo PTSC M&C, email+password, nút SSO, forgot password. 3 landing page khác nhau theo role sau login. Production-ready.' },
  { id:'s1-12', sprint_id:'sp-1', epic_code:'E02', sort_order:12, assignee_code:'ds',  day_label:'T3 21/4',      type:'design', status:'done',        priority:'critical', title:'Design: Dashboard — 4 KPI cards + alert banner + navigation sidebar',      description:'Dashboard chính: 4 KPI stat cards với số lớn + trend, alert banner (đỏ/vàng/xanh), sidebar navigation 4 nhóm, header tenant + avatar + logout.' },
  { id:'s1-13', sprint_id:'sp-1', epic_code:'E02', sort_order:13, assignee_code:'ds',  day_label:'T4 22/4',      type:'design', status:'done',        priority:'normal',   title:'Design: Danh sách nhân tài + luồng import + hiển thị lỗi',                description:'Danh sách: search, filter (tier/dept/risk), sort, import button. Import flow: upload → map cột → bảng lỗi → confirm. Line-by-line error display.' },
  { id:'s1-14', sprint_id:'sp-1', epic_code:'E02', sort_order:14, assignee_code:'ds',  day_label:'T5-T6 23-24/4',type:'design', status:'done',        priority:'normal',   title:'Design: Hồ sơ nhân viên production (view + edit + field visibility)',      description:'View: 91 trường tổ chức theo tab. Edit: salary 2 biến thể theo role. Tag risk factors. Upgrade từ prototype lên production.' },
  { id:'s1-15', sprint_id:'sp-1', epic_code:'E01', sort_order:15, assignee_code:'dj',  day_label:'T2-T5 20-23/4',type:'design', status:'done',        priority:'normal',   title:'Component: Button, Badge, Avatar, Input — full states + design tokens',    description:'Build Figma production: Button (4 variants × 4 states), Badge (6 types), Avatar (sizes), Input/Select/Date/Textarea. Xuất design tokens đồng bộ Tailwind.' },
  { id:'s1-16', sprint_id:'sp-1', epic_code:'E01', sort_order:16, assignee_code:'dj',  day_label:'T6 24/4',      type:'design', status:'done',        priority:'critical', title:'Component: KPI card + Alert banner + Toast + Modal + Skeleton',            description:'KPI stat card, Alert banner (3 severity levels), Toast (4 types), Confirmation modal, Skeleton loading. All dark mode ready.' },
  { id:'s1-17', sprint_id:'sp-1', epic_code:'E01', sort_order:17, assignee_code:'dev', day_label:'T2-T3 20-21/4',type:'dev',    status:'todo',        priority:'critical', title:'Dev: Supabase setup + Auth + SSO/LDAP + role routing',                     description:'Cấu hình Supabase, RLS policies, migrations. Auth: Supabase Auth + LDAP/AD cho PTSC M&C. Role-based redirect. 3 test accounts (1 mỗi role).' },
  { id:'s1-18', sprint_id:'sp-1', epic_code:'E02', sort_order:18, assignee_code:'dev', day_label:'T3-T5 21-23/4',type:'dev',    status:'todo',        priority:'critical', title:'Dev: CRUD nhân viên + audit trigger + field visibility middleware',         description:'Migration employees table. CRUD API routes. Audit trigger: mọi INSERT/UPDATE/DELETE tự ghi audit_logs. Field visibility middleware theo role.' },
  { id:'s1-19', sprint_id:'sp-1', epic_code:'E02', sort_order:19, assignee_code:'dev', day_label:'T5-T6 23-24/4',type:'dev',    status:'todo',        priority:'critical', title:'Dev: Import pipeline + validate từng dòng + API Dashboard summary',         description:'Excel/CSV parser, auto column detect, validation engine, line-by-line error aggregation, partial import API. Dashboard summary endpoint: 4 KPI counts.' },
  { id:'s1-20', sprint_id:'sp-1', epic_code:'E01', sort_order:20, assignee_code:'tl',  day_label:'T6 24/4',      type:'doc',    status:'done',        priority:'critical', title:'API Contracts document: mọi endpoint Sprint 1',                            description:'Document tất cả endpoints: method, request/response schema, error codes. DS và Dev dùng để build UI và API song song Sprint 2.' },
  { id:'s1-21', sprint_id:'sp-1', epic_code:'E01', sort_order:21, assignee_code:'tl',  day_label:'T6 24/4',      type:'review', status:'todo',        priority:'normal',   title:'Code review + Sprint 1 demo + retrospective',                              description:'TL review: RLS policies, audit triggers, no hardcoded secrets. Demo: login 3 roles, CRUD, import, dashboard, audit trail. Retro: blockers, velocity.' },

  // ══ SPRINT 2 — HRM360 Import + 9-Box + Succession (23 tasks) ══════════════
  // BA: Tiến (ba1), Ngân (ba2) · Designer: Đăng (ds), Hương (dj) · Dev · TL: Lê Duy (tl)
  { id:'s2-ba1-01', sprint_id:'sp-2', epic_code:'E03', sort_order:1,  assignee_code:'ba1', day_label:'Nghỉ lễ',       type:'spec',   status:'done', priority:'critical', estimated_hours:3, title:'Spec import HRM360: mapping CSV/API → assessment_scores',                     description:'HRM360 export file CSV với format đã biết (từ U06). Spec: (1) Column mapping: Tiêu chí, YC, TB, Tỉ lệ đạt, Trọng số, Điểm, Icon → assessment_scores fields. (2) 4 nguồn: QuanLy/DongNghiep/CapDuoi/CaNhan với weights cố định 50/30/20/0%. (3) Thang điểm 1-5 per tiêu chí, không phải 0-100. (4) Điểm tổng đã tính sẵn trong file HRM360 → SuccessionOS chỉ lưu, không tính lại.' },
  { id:'s2-ba1-02', sprint_id:'sp-2', epic_code:'E03', sort_order:2,  assignee_code:'ba1', day_label:'Nghỉ lễ',       type:'spec',   status:'done', priority:'critical', estimated_hours:3, title:'Spec hiển thị Assessment trên Talent Profile (từ HRM360 data)',              description:'Sau khi import HRM360 data, Talent Profile cần hiển thị: (1) Radar chart 13 tiêu chí thực tế vs yêu cầu. (2) Bảng kết quả tổng hợp: TC + YC + TB + Tỉ lệ đạt + Icon 🟢🟡🔴. (3) Điểm tổng hợp dùng để tính vị trí 9-Box. Không build form nhập tay — chỉ hiển thị data từ HRM360.' },
  { id:'s2-ba1-03', sprint_id:'sp-2', epic_code:'E03', sort_order:3,  assignee_code:'ba1', day_label:'Nghỉ lễ',       type:'spec',   status:'done', priority:'critical', estimated_hours:2, title:'Spec 9-Box: tính tọa độ từ điểm HRM360',                                     description:'9-Box MVP nhập tay (confirm từ A2 trong FEAT-01). Spec: (1) HR Admin nhập Performance score và Potential score thủ công per nhân viên. (2) Threshold: High perf ≥87, High pot ≥83. (3) Auto-layering sau khi Calibration lock: Ô 9 → Kế thừa, Ô 6/8 → Tiềm năng, Ô 5 → Nòng cốt. (4) Tương lai: tự tính từ điểm HRM360 (Phase 2).' },
  { id:'s2-ba1-04', sprint_id:'sp-2', epic_code:'E03', sort_order:4,  assignee_code:'ba1', day_label:'T2 05/5',       type:'spec',   status:'done', priority:'critical', estimated_hours:3, title:'Spec Calibration Room + Data Freezing',                                       description:'Phiên Calibration: (1) HR Admin mở phiên, invite hội đồng. (2) Xem 9-Box read-only, propose move với lý do. (3) Comment thread per nhân viên. (4) Lock: sau khi lock, toàn bộ tọa độ 9-Box bất biến, trigger auto-layering. (5) Audit log mọi action trong phiên. Edge case: chỉ HR Admin có quyền lock.' },
  { id:'s2-ba1-05', sprint_id:'sp-2', epic_code:'E03', sort_order:5,  assignee_code:'ba1', day_label:'T2 05/5',       type:'spec',   status:'done', priority:'critical', estimated_hours:3, title:'Spec Succession Backfill: fit score + Top 3 gợi ý',                          description:'Fit score algorithm cho vị trí trống: fit_score = overall_score - gap_penalty + idp_bonus - risk_penalty. Rank top 3 per vị trí. Rationale text 1 câu (rule-based, không cần AI API). API endpoint. Spec Dependency Score: <1 ứng viên ready-now = CRITICAL đỏ, =1 = HIGH vàng, ≥2 = OK xanh.' },
  { id:'s2-ba1-06', sprint_id:'sp-2', epic_code:'E03', sort_order:6,  assignee_code:'ba1', day_label:'T3 06/5',       type:'spec',   status:'done', priority:'priority', estimated_hours:2, title:'Spec Succession Density Dashboard',                                           description:'Dashboard alert: mỗi Vị trí Then chốt cần ≥2 ứng viên readiness=\'now\'. Spec: progress bar \'X/2 sẵn sàng ngay\', màu đỏ nếu thiếu, xanh nếu đủ. Alert notification khi position xuống dưới ngưỡng. 2 KPI cards: \'Vị trí có ≥2 ứng viên: X/12\' và \'Cần bổ sung gấp: Y\'.' },
  { id:'s2-ba2-01', sprint_id:'sp-2', epic_code:'E02', sort_order:7,  assignee_code:'ba2', day_label:'T2 05/5',       type:'test',   status:'todo', priority:'critical', estimated_hours:2, title:'Test: field visibility per role (lương số thực vs gap%)',                    description:'Verify Sprint 1 output: HR Admin thấy lương số thực, Manager thấy gap%, Employee ẩn hoàn toàn. Test ít nhất 3 employees với 3 accounts khác nhau.' },
  { id:'s2-ba2-02', sprint_id:'sp-2', epic_code:'E02', sort_order:8,  assignee_code:'ba2', day_label:'T2 05/5',       type:'test',   status:'todo', priority:'priority', estimated_hours:2, title:'Test: import file Excel/CSV line-by-line errors',                             description:'Upload file 50 rows, 10 rows lỗi (duplicate email row 5, missing name row 12...). Verify: hiển thị bảng lỗi đúng row numbers, 40 rows hợp lệ import được. Error messages đủ rõ để user tự fix.' },
  { id:'s2-ba2-03', sprint_id:'sp-2', epic_code:'E03', sort_order:9,  assignee_code:'ba2', day_label:'T3 06/5',       type:'test',   status:'todo', priority:'critical', estimated_hours:3, title:'Test: import HRM360 CSV → Talent Profile hiển thị đúng',                    description:'Upload sample CSV từ HRM360 cho emp-006 (VĐL). Verify: (1) 13 tiêu chí hiển thị đúng với điểm 1-5. (2) Icon 🟢🟡🔴 đúng theo threshold. (3) Điểm tổng 92.04 hiển thị đúng. (4) Radar chart 5 chiều đúng data. Test với ít nhất 3 employees.' },
  { id:'s2-ba2-04', sprint_id:'sp-2', epic_code:'E03', sort_order:10, assignee_code:'ba2', day_label:'T4 07/5',       type:'test',   status:'todo', priority:'critical', estimated_hours:2, title:'Test: 9-Box nhập tay + auto-layering',                                        description:'HR Admin nhập tay Performance=88, Potential=90 cho emp-006. Verify: emp-006 xuất hiện đúng ô 9-Box. Trigger Calibration lock → verify auto-layering: Ô 9 → tier=\'successor\', Ô 5 → tier=\'core\'. Verify audit_log ghi đúng reason=\'calibration_auto_layering\'.' },
  { id:'s2-ba2-05', sprint_id:'sp-2', epic_code:'E02', sort_order:11, assignee_code:'ba2', day_label:'T5 08/5',       type:'test',   status:'todo', priority:'normal',   estimated_hours:3, title:'Regression test Sprint 1 toàn bộ',                                            description:'Chạy lại tất cả test cases Sprint 1: auth + LDAP + role permissions, employee CRUD + import, field visibility, audit trail. Document bugs với severity + reproduction steps.' },
  { id:'s2-ds-01',  sprint_id:'sp-2', epic_code:'E03', sort_order:12, assignee_code:'ds',  day_label:'T2 05/5',       type:'design', status:'done', priority:'critical', estimated_hours:4, title:'Design: HRM360 import flow UI (upload → preview → confirm)',                  description:'Flow 3 bước: (1) Upload CSV file — dropzone với format guidance. (2) Preview: bảng dữ liệu sẽ import, mapping columns rõ ràng, errors highlighted. (3) Confirm: summary \'X employees sẽ được cập nhật điểm\'. Không cần design form nhập tay — chỉ import flow.' },
  { id:'s2-ds-02',  sprint_id:'sp-2', epic_code:'E03', sort_order:13, assignee_code:'ds',  day_label:'T3 06/5',       type:'design', status:'done', priority:'critical', estimated_hours:5, title:'Design: Talent Profile Assessment section (HRM360 data display)',             description:'Section hiển thị kết quả từ HRM360: (1) Radar chart 5 chiều (thực tế vs yêu cầu). (2) Bảng 13 tiêu chí gọn: TC + YC + TB + Tỉ lệ đạt + Icon. (3) Điểm tổng highlight lớn. (4) Nút \'Xem chi tiết 4 nguồn\' → expand accordion. Design compact, colorful per feedback khách hàng.' },
  { id:'s2-ds-03',  sprint_id:'sp-2', epic_code:'E03', sort_order:14, assignee_code:'ds',  day_label:'T4 07/5',       type:'design', status:'done', priority:'critical', estimated_hours:4, title:'Design: 9-Box nhập tay UI + Calibration Room',                               description:'9-Box: HR Admin click vào ô trong grid → dropdown chọn employee, confirm. Calibration Room: 9-Box interactive với chips + panel thảo luận bên phải + nút lock. Đã có prototype, nâng lên production-ready với data thật.' },
  { id:'s2-ds-04',  sprint_id:'sp-2', epic_code:'E03', sort_order:15, assignee_code:'ds',  day_label:'T5 08/5',       type:'design', status:'done', priority:'critical', estimated_hours:4, title:'Design: Succession position cards + Backfill AI panel + Density dashboard',  description:'Position cards: badge mức độ kế thừa (xanh/vàng/đỏ), alert banner, Dependency Score badge. AI Backfill slide panel: top 3 candidates + fit score + lý do + add button. Density dashboard: 2 KPI cards + progress bars per vị trí.' },
  { id:'s2-dj-01',  sprint_id:'sp-2', epic_code:'E03', sort_order:16, assignee_code:'dj',  day_label:'T2-T3 05-06/5', type:'design', status:'done', priority:'critical', estimated_hours:5, title:'Components: icon 🟢🟡🔴 + score badges + assessment chips',                   description:'Build: (1) InsightIcon component (🟢🟡🔴 với tooltip ngưỡng). (2) ScoreBadge: điểm tổng với color coding. (3) AssessmentChip: per tiêu chí với tỉ lệ đạt mini bar. (4) SourceBreakdown: 4 nguồn compact (QM/ĐN/CĐ/CN). Dùng chung Talent Profile + Calibration.' },
  { id:'s2-dj-02',  sprint_id:'sp-2', epic_code:'E03', sort_order:17, assignee_code:'dj',  day_label:'T4-T5 07-08/5', type:'design', status:'done', priority:'critical', estimated_hours:4, title:'Components: position alert banner + KPI stat cards + Dependency badge',       description:'Alert banner 3 severity levels. KPI stat cards với gradient backgrounds. Dependency Score badge: CRITICAL đỏ / HIGH vàng / OK xanh. Progress bar với threshold marker (hiện vạch \'tối thiểu 2\'). Tất cả responsive + dark mode.' },
  { id:'s2-dev-01', sprint_id:'sp-2', epic_code:'E02', sort_order:18, assignee_code:'dev', day_label:'T2-T3 05-06/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:6, title:'Import pipeline hoàn chỉnh + field visibility middleware',                    description:'Hoàn thiện từ Sprint 1: (1) Excel/CSV parser với column mapping, validation engine, line-by-line error aggregation, partial import. (2) Field visibility middleware: HOC nhận field name + role → actual/percentage/hidden. Apply vào tất cả sensitive fields employee profile.' },
  { id:'s2-dev-02', sprint_id:'sp-2', epic_code:'E03', sort_order:19, assignee_code:'dev', day_label:'T2-T4 05-07/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:8, title:'HRM360 import: parser CSV + store assessment_scores',                         description:'Build HRM360 import pipeline: (1) Parse CSV format từ U06 (13 tiêu chí × 4 nguồn × scores). (2) Validate format, báo lỗi cụ thể. (3) Store vào assessment_scores table: employee_id, cycle_id, source, criterion_id, score (1-5), overall_score. (4) API endpoint: POST /assessments/import-hrm360.' },
  { id:'s2-dev-03', sprint_id:'sp-2', epic_code:'E03', sort_order:20, assignee_code:'dev', day_label:'T3-T5 06-08/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:8, title:'9-Box nhập tay + auto-layering sau Calibration lock',                        description:'(1) nine_box_scores table: employee_id, cycle_id, performance_score, potential_score, entered_by, entered_at. (2) API: PUT /nine-box/:employee_id. (3) Calibration Session: create/invite/propose-move/comment/lock. (4) Auto-layering trigger sau lock: bulk update talent_tier_history. (5) Audit log mọi action.' },
  { id:'s2-dev-04', sprint_id:'sp-2', epic_code:'E03', sort_order:21, assignee_code:'dev', day_label:'T4-T5 07-08/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:6, title:'Succession Map API + Backfill Top 3 + Dependency Score',                     description:'(1) Succession Map: positions với successors list + readiness. (2) Backfill API: GET /positions/:id/backfill → fit_score per candidate, top 3, rationale text rule-based. (3) Dependency Score: đếm ready-now successors per position → CRITICAL/HIGH/OK. (4) Cache 24h, invalidate khi assessment scores thay đổi.' },
  { id:'s2-dev-05', sprint_id:'sp-2', epic_code:'E05', sort_order:22, assignee_code:'dev', day_label:'T5-T6 08-09/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:5, title:'UI Integration: /talent và /positions kết nối real API',                     description:'Thay mock data trong /talent và /positions bằng Supabase calls. Verify field visibility đúng per role. Test với data HRM360 thật sau import. /talent/[id]: Radar chart và bảng 13 tiêu chí từ assessment_scores thật.' },
  { id:'s2-tl-01',  sprint_id:'sp-2', epic_code:'E03', sort_order:23, assignee_code:'tl',  day_label:'T6 09/5',       type:'review', status:'todo', priority:'normal',   estimated_hours:3, title:'Review code + demo Sprint 2 + confirm Sprint 3 scope',                       description:'TL review: HRM360 import accuracy (verify với sample CSV), 9-Box correctness, auto-layering logic, fit_score algorithm. Demo Sprint 2 cho PM. Retro + xác nhận scope Sprint 3.' },

  // ══ SPRINT 3 — UI Integration + IDP + Staging (14 tasks) ════════════════
  // BA: Tiến (ba1), Ngân (ba2) · Designer: Đăng (ds), Hương (dj) · Dev · TL: Lê Duy (tl)
  { id:'s3-ba1-01', sprint_id:'sp-3', epic_code:'E04', sort_order:1,  assignee_code:'ba1', day_label:'T2 12/5',       type:'spec',   status:'done', priority:'critical', estimated_hours:4, title:'Spec IDP: draft + 3 activity types + approval 3 cấp + data consent',         description:'IDP spec đơn giản cho UAT 18/5: (1) Draft status (lưu không cần đủ trường). (2) 3 loại activities: stretch/rotation (70%), mentoring session (20%), formal training (10%). (3) Progress tự tính từ completed activities. (4) Approval 3 cấp: Line Manager → TCNS → Ban PTNT. (5) Data consent hard-stop: bắt buộc tick trước khi submit.' },
  { id:'s3-ba1-02', sprint_id:'sp-3', epic_code:'E08', sort_order:2,  assignee_code:'ba1', day_label:'T3 13/5',       type:'doc',    status:'done', priority:'critical', estimated_hours:4, title:'UAT test script: 25 bước cho 3 roles',                                        description:'Script UAT cho khách hàng PTSC M&C chạy ngày 18/5. 3 roles: HR Admin (import HRM360, quản lý nhân viên, Calibration, Succession), Manager (duyệt IDP, xem team 9-Box), Employee (tạo IDP, xem hồ sơ). Happy path rõ ràng. Tiêu chí pass/fail per step.' },
  { id:'s3-ba1-03', sprint_id:'sp-3', epic_code:'E08', sort_order:3,  assignee_code:'ba1', day_label:'T4 14/5',       type:'doc',    status:'done', priority:'critical', estimated_hours:3, title:'Spec seed data: 25 nhân viên PTSC M&C đầy đủ',                               description:'Danh sách 25 nhân viên thực với đầy đủ: HRM360 assessment scores (13 tiêu chí), 9-Box tọa độ, IDP activities, risk factors, certifications, succession map. Dùng tên thật / hóa danh per yêu cầu bảo mật.' },
  { id:'s3-ba2-01', sprint_id:'sp-3', epic_code:'E04', sort_order:4,  assignee_code:'ba2', day_label:'T2 12/5',       type:'test',   status:'blocked', priority:'critical', estimated_hours:3, title:'Test: IDP draft + submit + data consent hard-stop',                           description:'Test: (1) Lưu draft không cần đủ trường. (2) Gửi phê duyệt: nếu chưa tick consent → blocked. (3) Approval 3 cấp: gửi → notify Manager → approve → notify TCNS → approve → notify Ban PTNT. (4) Audit log mỗi bước. Edge: reject ở cấp 2 → trả về employee.' },
  { id:'s3-ba2-02', sprint_id:'sp-3', epic_code:'E05', sort_order:5,  assignee_code:'ba2', day_label:'T3-T4 13-14/5', type:'test',   status:'todo', priority:'normal',   estimated_hours:5, title:'Regression toàn bộ app + test UI integration',                               description:'Chạy lại tất cả test Sprint 1+2. Verify: (1) Tất cả màn hình chạy real data. (2) HRM360 import → Talent Profile → 9-Box flow end-to-end. (3) Succession Map đúng. Document bugs với severity.' },
  { id:'s3-ba2-03', sprint_id:'sp-3', epic_code:'E08', sort_order:6,  assignee_code:'ba2', day_label:'T5 15/5',       type:'test',   status:'done', priority:'critical', estimated_hours:3, title:'Finalize UAT test cases: happy path + edge cases',                            description:'Hoàn thiện test cases cho khách hàng ngày 18/5: happy path mỗi role (8-10 steps), edge cases quan trọng, tiêu chí pass/fail. Phối hợp với script của Tiến.' },
  { id:'s3-ds-01',  sprint_id:'sp-3', epic_code:'E04', sort_order:7,  assignee_code:'ds',  day_label:'T2-T3 12-13/5', type:'design', status:'done', priority:'critical', estimated_hours:5, title:'Design: IDP wizard production — Draft + 70-20-10 tabs + Approval',           description:'IDP production: (1) Draft indicator rõ ràng. (2) 3 tabs 70-20-10 với activity cards. (3) Multi-step approval stepper (3 cấp) + consent checkbox hard-stop. (4) Status timeline: draft → submitted → level1 → level2 → approved. Prototype đã có, nâng lên production.' },
  { id:'s3-ds-02',  sprint_id:'sp-3', epic_code:'E05', sort_order:8,  assignee_code:'ds',  day_label:'T4-T5 14-15/5', type:'design', status:'done', priority:'critical', estimated_hours:5, title:'Design: Empty states + loading skeletons + error states toàn app',            description:'Tất cả trang chính cần: (1) Empty state khi chưa có data (hình + CTA button). (2) Loading skeleton 300ms trước khi data load. (3) Error state khi API fail (retry button). (4) Consistent với design system đã build.' },
  { id:'s3-dj-01',  sprint_id:'sp-3', epic_code:'E04', sort_order:9,  assignee_code:'dj',  day_label:'T2-T3 12-13/5', type:'design', status:'done', priority:'critical', estimated_hours:4, title:'IDP activity cards + 70-20-10 progress visual',                              description:'(1) Activity card: type badge (70%/20%/10%), progress bar, deadline, status dot animation. (2) 70-20-10 overview: 3 progress bars stacked với màu per type. (3) Stretch assignment modal: form add task compact. Dùng lại nhiều trang.' },
  { id:'s3-dj-02',  sprint_id:'sp-3', epic_code:'E05', sort_order:10, assignee_code:'dj',  day_label:'T4-T5 14-15/5', type:'design', status:'done', priority:'normal',   estimated_hours:4, title:'Responsive fixes + micro-interactions toàn app',                              description:'(1) Tablet responsive (768-1024px): sidebar icon-only, grid 2 cột. (2) Mobile (<768px): hamburger, stack layout. (3) Micro-interactions: hover states, toast animations, accordion transitions. (4) Dark mode verification tất cả màn hình.' },
  { id:'s3-dev-01', sprint_id:'sp-3', epic_code:'E05', sort_order:11, assignee_code:'dev', day_label:'T2-T3 12-13/5', type:'dev',    status:'done', priority:'critical', estimated_hours:8, title:'UI Integration toàn bộ: /assessment + /succession + /calibration → real API', description:'Thay mock data trong: /assessment (HRM360 import flow + display), /succession (9-Box + Calibration Room), /calibration (real session data). Test với 25 employees PTSC M&C thật. Verify field visibility đúng sau integration.' },
  { id:'s3-dev-02', sprint_id:'sp-3', epic_code:'E04', sort_order:12, assignee_code:'dev', day_label:'T3-T4 13-14/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:8, title:'IDP CRUD + 3 activity types + approval workflow 3 cấp',                      description:'(1) IDP: create draft, update, submit. (2) Activities CRUD: stretch/rotation/mentoring/training, progress tracking. (3) Approval workflow 3 cấp: chain notifications via Resend, approve/reject per cấp, deadline 7 ngày per cấp, audit log. (4) Data consent: required checkbox stored với timestamp.' },
  { id:'s3-dev-03', sprint_id:'sp-3', epic_code:'E08', sort_order:13, assignee_code:'dev', day_label:'T4-T6 14-16/5', type:'dev',    status:'todo', priority:'critical', estimated_hours:6, title:'Seed 25 PTSC M&C employees + end-to-end smoke test + staging freeze',        description:'(1) Seed script: 25 employees với full data (HRM360 scores, 9-Box, IDP, certs, succession). (2) End-to-end smoke test: HR Admin login → import HRM360 → Calibration → view Succession → create IDP → approve. (3) Fix critical bugs ngay. (4) Deploy staging, không deploy thêm sau T6 16/5.' },
  { id:'s3-tl-01',  sprint_id:'sp-3', epic_code:'E08', sort_order:14, assignee_code:'tl',  day_label:'T5-T6 15-16/5', type:'review', status:'todo', priority:'critical', estimated_hours:4, title:'Internal demo + sign off staging + confirm UAT ready',                       description:'Chạy full demo 25 phút với toàn team. Verify: tất cả core flows hoạt động với real data. Performance audit: page load <3s. Security review: RLS policies, no exposed secrets. Sign off staging cho UAT 18/5.' },

  // ══ SPRINT 4 — Fix UAT & IDP & Approval (12 tasks) ══════════════════════
  { id:'s4-01', sprint_id:'sp-4', epic_code:'E05', sort_order:1,  assignee_code:'ba1', day_label:'T2 19/5',      type:'spec',   status:'todo', priority:'critical', title:'Phân loại feedback UAT: critical / UX / feature request',                description:'Sáng 18/5: collect UAT feedback. Chiều: phân loại với TL: P1 bugs (fix ngay), UX (fix nếu < 2h), feature requests (backlog). Assign cho team.' },
  { id:'s4-02', sprint_id:'sp-4', epic_code:'E05', sort_order:2,  assignee_code:'ba1', day_label:'T2-T3 19-20/5',type:'spec',   status:'done', priority:'critical', title:'Spec IDP: nháp + 3 loại hoạt động + phê duyệt 3 cấp',                   description:'IDP draft status (lưu khi chưa đủ). 3 loại: thực tế 70%, kèm cặp 20%, đào tạo chính quy 10%. Approval flow: Manager → TCNS → Ban PTNT.' },
  { id:'s4-03', sprint_id:'sp-4', epic_code:'E05', sort_order:3,  assignee_code:'ba1', day_label:'T3-T4 20-21/5',type:'spec',   status:'todo', priority:'critical', title:'Spec Phê duyệt đa cấp 8 cấp + IDP Gatekeeping',                          description:'Workflow Engine: config số cấp (1-8) + người duyệt per loại. Auto-escalate khi quá hạn. Gatekeeping: assessment < 80% → IDP pause, notify manager.' },
  { id:'s4-04', sprint_id:'sp-4', epic_code:'E05', sort_order:4,  assignee_code:'ba1', day_label:'T4-T5 21-22/5',type:'doc',    status:'todo', priority:'critical', title:'Kịch bản demo BOD: 25 phút step-by-step',                                description:'Script demo 25 phút: /positions (alert+backfill) → /talent/emp-006 (risk+audit) → /assessment (3 nguồn) → /calibration (lock) → /reports (ROI). FAQ BOD.' },
  { id:'s4-05', sprint_id:'sp-4', epic_code:'E05', sort_order:5,  assignee_code:'ba2', day_label:'T2-T3 19-20/5',type:'test',   status:'todo', priority:'critical', title:'Document + test tất cả UAT bugs P1/P2',                                  description:'Document chi tiết: mô tả, steps, screenshot, severity. Test lại sau khi dev fix. Confirm với khách hàng.' },
  { id:'s4-06', sprint_id:'sp-4', epic_code:'E05', sort_order:6,  assignee_code:'ba2', day_label:'T4-T5 21-22/5',type:'test',   status:'todo', priority:'critical', title:'Test: IDP flow 3 cấp + Gatekeeping + IDP versioning',                    description:'IDP: save draft, send approval (blocked nếu chưa consent), approval chain 3 cấp. Gatekeeping: < 80% → pause. Versioning: mỗi approve tạo version mới.' },
  { id:'s4-07', sprint_id:'sp-4', epic_code:'E05', sort_order:7,  assignee_code:'ds',  day_label:'T2-T3 19-20/5',type:'design', status:'todo', priority:'critical', title:'Design: IDP production — wizard + tab 70-20-10 + approval stepper',       description:'Wizard IDP: draft + gửi duyệt. Tab 70-20-10: activity badges, progress bar. Approval stepper. Consent checkbox hard-stop.' },
  { id:'s4-08', sprint_id:'sp-4', epic_code:'E05', sort_order:8,  assignee_code:'ds',  day_label:'T3-T5 20-22/5',type:'design', status:'todo', priority:'critical', title:'Design: Approval stepper 8 cấp + Mentoring room production',              description:'Stepper 8 cấp: visual state mỗi cấp, người duyệt, deadline, comment. Mentoring room: danh sách cặp + log-book timeline + form thêm buổi.' },
  { id:'s4-09', sprint_id:'sp-4', epic_code:'E05', sort_order:9,  assignee_code:'dj',  day_label:'T2-T4 19-21/5',type:'design', status:'todo', priority:'critical', title:'Component: IDP activity card + version history panel + KTP list',         description:'Activity card stretch: badge type (6 màu), progress bar. Version history timeline. KTP list: 4 types, importance level, transfer progress.' },
  { id:'s4-10', sprint_id:'sp-4', epic_code:'E05', sort_order:10, assignee_code:'dev', day_label:'T2-T3 19-20/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Sửa toàn bộ P1 bugs từ UAT',                                         description:'Fix tất cả P1 bugs từ UAT 18/5. Không thêm feature cho đến khi hết P1. Deploy từng fix lên staging và verify ngay.' },
  { id:'s4-11', sprint_id:'sp-4', epic_code:'E05', sort_order:11, assignee_code:'dev', day_label:'T2-T4 19-21/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: IDP CRUD + 3-cấp approval + Gatekeeping trigger',                   description:'IDP: create draft, add activities (3 types), auto-calculate progress. Approval chain: send → email notify → approve/reject cấp 1→2→3. Gatekeeping monitor.' },
  { id:'s4-12', sprint_id:'sp-4', epic_code:'E05', sort_order:12, assignee_code:'dev', day_label:'T3-T6 20-23/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Workflow Engine 8 cấp + IDP versioning + Mentoring CRUD',            description:'Workflow Engine: config levels + approvers. Auto-escalate. IDP versioning: new version mỗi approve. Mentoring CRUD: pairs + session log + hours tracking.' },

  // ══ SPRINT 5 — AI & Kirkpatrick & BOD Demo (12 tasks) ═══════════════════
  { id:'s5-01', sprint_id:'sp-5', epic_code:'E06', sort_order:1,  assignee_code:'ba1', day_label:'T2 26/5',      type:'spec',   status:'todo', priority:'critical', title:'Spec AI Career Path + Explainable AI',                                    description:'Claude API: prompt engineering với context nhân viên, streaming, parse 3 lựa chọn. Explainable AI: top 3 lý do dạng tooltip. Approve 1 → lưu DB.' },
  { id:'s5-02', sprint_id:'sp-5', epic_code:'E06', sort_order:2,  assignee_code:'ba1', day_label:'T3-T4 27-28/5',type:'doc',    status:'todo', priority:'critical', title:'Hoàn thiện demo script + FAQ BOD (10 câu hay hỏi)',                      description:'Demo 25 phút đã rehearse. FAQ: 10 câu BOD hay hỏi + trả lời chuẩn. Backup plan nếu mất kết nối. Print-out cho presenter.' },
  { id:'s5-03', sprint_id:'sp-5', epic_code:'E06', sort_order:3,  assignee_code:'ba2', day_label:'T2-T3 26-27/5',type:'test',   status:'todo', priority:'critical', title:'Test: AI Career Path + Explainable AI + Kirkpatrick ROI',                 description:'AI: generate 3 options, verify Explainable AI đúng, approve 1, archive rest. Kirkpatrick: verify tính toán 5 cấp, ROI comparison đúng công thức.' },
  { id:'s5-04', sprint_id:'sp-5', epic_code:'E06', sort_order:4,  assignee_code:'ba2', day_label:'T4-T5 28-29/5',type:'test',   status:'todo', priority:'normal',   title:'Regression cuối + re-test toàn bộ UAT items đã fix',                     description:'Full regression. Re-test tất cả UAT items đã fix. Ghi kết quả vào QA report cuối cho BOD nếu cần.' },
  { id:'s5-05', sprint_id:'sp-5', epic_code:'E06', sort_order:5,  assignee_code:'ds',  day_label:'T2 26/5',      type:'design', status:'todo', priority:'critical', title:'Design: AI Career Path UI — loading + 3 option cards + Explainable AI',  description:'Loading state (spinner + text động). 3 option cards: fit score, mô tả, skill gaps. Explainable AI panel: top 3 lý do dạng chip + confidence bar. Nút Chọn + Lưu.' },
  { id:'s5-06', sprint_id:'sp-5', epic_code:'E06', sort_order:6,  assignee_code:'ds',  day_label:'T3-T4 27-28/5',type:'design', status:'todo', priority:'critical', title:'Design: Bộ slide BOD hoàn chỉnh (professional deck)',                     description:'Deck BOD: vấn đề PTSC M&C, giải pháp SuccessionOS, demo screenshots, ROI 262%, roadmap tiếp theo. Professional design màu PTSC M&C.' },
  { id:'s5-07', sprint_id:'sp-5', epic_code:'E06', sort_order:7,  assignee_code:'ds',  day_label:'T5 29/5',      type:'design', status:'todo', priority:'normal',   title:'Design: Báo cáo Kirkpatrick 5 cấp + ROI comparison table',               description:'5 level cards: L1-L5 với ROI 262%. So sánh: OJD 520% vs Mentoring 327% vs Formal 180%. Insight box khuyến nghị chiến lược.' },
  { id:'s5-08', sprint_id:'sp-5', epic_code:'E06', sort_order:8,  assignee_code:'dj',  day_label:'T2-T3 26-27/5',type:'design', status:'todo', priority:'normal',   title:'Component: AI tab trong hồ sơ + Domino Risk diagram + Simulation',       description:'AI tab: lộ trình đã chọn + Explainable AI tooltip. Domino Risk diagram: chain reaction. Succession Simulation: what-if drag (read-only).' },
  { id:'s5-09', sprint_id:'sp-5', epic_code:'E06', sort_order:9,  assignee_code:'dj',  day_label:'T5-T6 29-30/5',type:'design', status:'todo', priority:'normal',   title:'Performance + security audit + staging freeze',                          description:'Performance: page load < 3s, API < 500ms. Security: RLS policies, data leakage, no exposed secrets. Staging frozen sau T6 30/5.' },
  { id:'s5-10', sprint_id:'sp-5', epic_code:'E06', sort_order:10, assignee_code:'dev', day_label:'T2-T4 26-28/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Claude API tích hợp — AI Career Path + Explainable AI + Domino Risk',description:'Claude API: prompt engineering, streaming, parse 3 options, Explainable AI output. Career Path: generate → approve 1 → lưu DB. Domino Risk chain calculator. Succession Simulation what-if.' },
  { id:'s5-11', sprint_id:'sp-5', epic_code:'E06', sort_order:11, assignee_code:'dev', day_label:'T3-T5 27-29/5',type:'dev',    status:'todo', priority:'normal',   title:'Dev: Kirkpatrick engine + Market Intel manual + Succession Simulation',   description:'Kirkpatrick: tổng hợp từ assessments/IDP/costs → L1-L5, ROI comparison 3 methods. Market Intel: HR nhập benchmark manual. Succession Simulation what-if engine.' },
  { id:'s5-12', sprint_id:'sp-5', epic_code:'E06', sort_order:12, assignee_code:'tl',  day_label:'T5-T6 29-30/5',type:'dev',    status:'todo', priority:'critical', title:'Deploy staging cuối + diễn tập demo 2 lần + staging freeze',             description:'Deploy phiên bản cuối. Diễn tập demo 25 phút với toàn team (2 lần). Ghi lại timing, câu khó. Fix issues cuối. Staging frozen sau diễn tập.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function computeStats(tasks: Task[]) {
  return {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    blocked:    tasks.filter(t => t.status === 'blocked').length,
    critical:   tasks.filter(t => t.priority === 'critical').length,
  }
}

export function getSprintStats(sprintId: string) {
  return computeStats(TASKS.filter(x => x.sprint_id === sprintId))
}

export const SPRINT_1_STATS = getSprintStats('sp-1')

export const TASK_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  spec:   { bg: '#EEF2FF', text: '#4F46E5', label: 'Spec' },
  story:  { bg: '#F0FDF4', text: '#15803D', label: 'Story' },
  design: { bg: '#F5F3FF', text: '#7C3AED', label: 'Design' },
  dev:    { bg: '#FFF7ED', text: '#C2410C', label: 'Dev' },
  test:   { bg: '#FEF9C3', text: '#854D0E', label: 'Test' },
  review: { bg: '#F1F5F9', text: '#475569', label: 'Review' },
  doc:    { bg: '#F0F9FF', text: '#0369A1', label: 'Doc' },
}

export const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'todo':        { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Todo' },
  'in-progress': { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6', label: 'Đang làm' },
  'done':        { bg: '#F0FDF4', text: '#22C55E', dot: '#22C55E', label: 'Xong' },
  'blocked':     { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444', label: 'Blocked' },
  'outline':     { bg: '#F9F8F5', text: '#78716C', dot: '#A8A29E', label: 'Outline' },
}

export const PRIORITY_STYLES: Record<string, { text: string; label: string }> = {
  critical: { text: '#EF4444', label: 'Critical' },
  priority: { text: '#F97316', label: 'Priority' },
  normal:   { text: '#6B7280', label: 'Normal' },
  high:     { text: '#F97316', label: 'High' },
  medium:   { text: '#F59E0B', label: 'Medium' },
  low:      { text: '#6B7280', label: 'Low' },
}
