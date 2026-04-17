// Static mock data — sourced from SuccessionOS_Sprint_v2.xlsx
// 77 tasks, 6 epics, 5 sprints

export const PROJECT = {
  id: 'proj-001',
  name: 'Dự án Kế nhiệm (Succession Planning)',
  description: 'Xây dựng SuccessionOS — Succession Planning SaaS cho doanh nghiệp.',
  start_date: '2026-04-20',
  end_date: '2026-05-31',
  status: 'active' as const,
  progress_percent: 0,
}

export const GOALS = [
  'Xây dựng hệ thống quản lý kế nhiệm cho doanh nghiệp',
  'Thiết kế quy trình đánh giá, lựa chọn và phát triển nhân sự kế cận',
  'Chuẩn hóa dữ liệu, mô hình năng lực và lộ trình phát triển',
]

export const MILESTONES = [
  { id: 'ms-1', order: 1, date: '2026-04-20', title: 'Khởi động Dự án (Kick-off)',        description: 'Chốt đội ngũ và thống nhất quy trình làm việc.',                          is_done: false },
  { id: 'ms-2', order: 2, date: '2026-04-24', title: 'Foundation & Dashboard deployed',   description: 'Auth + CRUD nhân viên + Dashboard KPI + audit trail.',                     is_done: false },
  { id: 'ms-3', order: 3, date: '2026-05-09', title: 'Vị Trí & Bản Đồ Kế Thừa xong',    description: 'Succession Map, 9-Box, Assessment Engine, AI Backfill.',                   is_done: false },
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
  { id: 'ep-01', code: 'E01', name: 'Nền tảng & Auth',       sprint_id: 'sp-1', color: '#4F46E5' },
  { id: 'ep-02', code: 'E02', name: 'Dashboard & Nhân Tài',   sprint_id: 'sp-1', color: '#0EA5E9' },
  { id: 'ep-03', code: 'E03', name: 'Vị Trí & Kế Thừa',      sprint_id: 'sp-2', color: '#10B981' },
  { id: 'ep-04', code: 'E04', name: 'Assessment & 9-Box',     sprint_id: 'sp-2', color: '#F59E0B' },
  { id: 'ep-05', code: 'E05', name: 'IDP & Phê duyệt',        sprint_id: 'sp-4', color: '#8B5CF6' },
  { id: 'ep-06', code: 'E06', name: 'AI & Báo cáo',           sprint_id: 'sp-5', color: '#EC4899' },
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
    status: 'active' as SprintStatus, progress_percent: 5,
    epics: ['E01 · Nền tảng & Auth', 'E02 · Dashboard & Nhân Tài'],
  },
  {
    id: 'sp-2', name: 'Sprint 2', theme: 'Vị Trí & Bản Đồ Kế Thừa',
    start_date: '2026-05-05', end_date: '2026-05-09',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E03 · Vị Trí & Kế Thừa', 'E04 · Assessment & 9-Box'],
  },
  {
    id: 'sp-3', name: 'Sprint 3', theme: 'Tích hợp & UAT Ready',
    start_date: '2026-05-12', end_date: '2026-05-16',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E03 · Vị Trí & Kế Thừa', 'E04 · Assessment & 9-Box'],
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
  { id:'s1-01', sprint_id:'sp-1', epic_code:'E01', sort_order:1,  assignee_code:'ba1', day_label:'T2 20/4',      type:'spec',   status:'in-progress', priority:'critical', title:'Spec schema DB: 8 bảng chính + tenant + RLS',                              description:'Thiết kế đầy đủ: employees, positions, assessment_cycles, scores, risk_factors, certifications, audit_logs, role_permissions. Kiểu dữ liệu, FK, indexes, RLS policy per tenant. Xác nhận với Tech Lead trước migrate.' },
  { id:'s1-02', sprint_id:'sp-1', epic_code:'E01', sort_order:2,  assignee_code:'ba1', day_label:'T2 20/4',      type:'spec',   status:'in-progress', priority:'critical', title:'Spec audit_logs: trigger mọi bảng nhạy cảm',                               description:'Bảng ghi: table_name, record_id, actor, timestamp, action, old_val/new_val (jsonb), reason. Trigger INSERT/UPDATE/DELETE tự động. Bắt buộc theo Điều 7.' },
  { id:'s1-03', sprint_id:'sp-1', epic_code:'E02', sort_order:3,  assignee_code:'ba1', day_label:'T3 21/4',      type:'spec',   status:'todo',        priority:'critical', title:'Spec ma trận hiển thị trường theo vai trò',                                description:'Quyết định từng field: HR Admin thấy lương số thực, Manager thấy gap%, Employee ẩn. Áp dụng RLS + middleware. Đây là nền tảng cho tính năng Nhân Tài.' },
  { id:'s1-04', sprint_id:'sp-1', epic_code:'E02', sort_order:4,  assignee_code:'ba1', day_label:'T3 21/4',      type:'spec',   status:'todo',        priority:'critical', title:'Spec data consent hard-stop',                                               description:'Checkbox bắt buộc trước mọi form submit. Nút Gửi disabled đến khi tick. Lưu timestamp + user_id vào audit_log. Áp dụng cho IDP, Assessment, CRUD nhân viên.' },
  { id:'s1-05', sprint_id:'sp-1', epic_code:'E02', sort_order:5,  assignee_code:'ba1', day_label:'T4 22/4',      type:'spec',   status:'todo',        priority:'normal',   title:'Spec import Excel/CSV: mapping cột + báo lỗi từng dòng',                  description:'Pipeline: upload → auto-detect cột → validate → báo lỗi từng dòng (số dòng + trường + message) → partial import với xác nhận. Format xlsx/csv.' },
  { id:'s1-06', sprint_id:'sp-1', epic_code:'E02', sort_order:6,  assignee_code:'ba1', day_label:'T5-T6 23-24/4',type:'spec',   status:'todo',        priority:'critical', title:'Spec Dashboard: 4 KPI cards + alert list + navigation',                    description:'4 KPI: vị trí thiếu kế thừa, nhân tài rủi ro, IDP chờ duyệt, cert sắp hết hạn. Alert list cho từng KPI. Nav từ Dashboard → trang chi tiết. Mobile responsive.' },
  { id:'s1-07', sprint_id:'sp-1', epic_code:'E01', sort_order:7,  assignee_code:'ba2', day_label:'T2 20/4',      type:'story',  status:'todo',        priority:'critical', title:'User story: Auth flows (login, SSO, redirect theo vai trò)',               description:'Story cho: login email/password, SSO (LDAP của PTSC M&C), forgot password, redirect đúng trang theo role. AC: sai password, tài khoản khóa, session hết hạn.' },
  { id:'s1-08', sprint_id:'sp-1', epic_code:'E02', sort_order:8,  assignee_code:'ba2', day_label:'T3 21/4',      type:'story',  status:'todo',        priority:'normal',   title:'User story: CRUD nhân viên + import file',                                 description:'Story cho: thêm/sửa/xóa nhân viên, import Excel/CSV, hiển thị lỗi từng dòng. AC: email trùng, thiếu trường bắt buộc, sai định dạng ngày.' },
  { id:'s1-09', sprint_id:'sp-1', epic_code:'E01', sort_order:9,  assignee_code:'ba2', day_label:'T4 22/4',      type:'test',   status:'todo',        priority:'critical', title:'Test case: Auth + LDAP + phân quyền vai trò',                              description:'Test: login thành công/thất bại, SSO, LDAP PTSC M&C, redirect theo role, session expiry, logout. Quyền: HR Admin/Manager/Employee thấy menu gì.' },
  { id:'s1-10', sprint_id:'sp-1', epic_code:'E02', sort_order:10, assignee_code:'ba2', day_label:'T5 23/4',      type:'test',   status:'todo',        priority:'critical', title:'Test case: CRUD nhân viên + import + hiển thị trường theo vai trò',        description:'CRUD: create (success, duplicate, missing), read (filter/sort), update (partial, salary per role), soft delete. Import: valid file, mixed errors, empty file.' },
  { id:'s1-11', sprint_id:'sp-1', epic_code:'E01', sort_order:11, assignee_code:'ds',  day_label:'T2 20/4',      type:'design', status:'todo',        priority:'critical', title:'Design: Login production + SSO + 3 landing pages theo vai trò',            description:'Trang login: logo PTSC M&C, email+password, nút SSO, forgot password. 3 landing page khác nhau theo role sau login. Production-ready.' },
  { id:'s1-12', sprint_id:'sp-1', epic_code:'E02', sort_order:12, assignee_code:'ds',  day_label:'T3 21/4',      type:'design', status:'todo',        priority:'critical', title:'Design: Dashboard — 4 KPI cards + alert banner + navigation sidebar',      description:'Dashboard chính: 4 KPI stat cards với số lớn + trend, alert banner (đỏ/vàng/xanh), sidebar navigation 4 nhóm, header tenant + avatar + logout.' },
  { id:'s1-13', sprint_id:'sp-1', epic_code:'E02', sort_order:13, assignee_code:'ds',  day_label:'T4 22/4',      type:'design', status:'todo',        priority:'normal',   title:'Design: Danh sách nhân tài + luồng import + hiển thị lỗi',                description:'Danh sách: search, filter (tier/dept/risk), sort, import button. Import flow: upload → map cột → bảng lỗi → confirm. Line-by-line error display.' },
  { id:'s1-14', sprint_id:'sp-1', epic_code:'E02', sort_order:14, assignee_code:'ds',  day_label:'T5-T6 23-24/4',type:'design', status:'todo',        priority:'normal',   title:'Design: Hồ sơ nhân viên production (view + edit + field visibility)',      description:'View: 91 trường tổ chức theo tab. Edit: salary 2 biến thể theo role. Tag risk factors. Upgrade từ prototype lên production.' },
  { id:'s1-15', sprint_id:'sp-1', epic_code:'E01', sort_order:15, assignee_code:'dj',  day_label:'T2-T5 20-23/4',type:'design', status:'todo',        priority:'normal',   title:'Component: Button, Badge, Avatar, Input — full states + design tokens',    description:'Build Figma production: Button (4 variants × 4 states), Badge (6 types), Avatar (sizes), Input/Select/Date/Textarea. Xuất design tokens đồng bộ Tailwind.' },
  { id:'s1-16', sprint_id:'sp-1', epic_code:'E01', sort_order:16, assignee_code:'dj',  day_label:'T6 24/4',      type:'design', status:'todo',        priority:'critical', title:'Component: KPI card + Alert banner + Toast + Modal + Skeleton',            description:'KPI stat card, Alert banner (3 severity levels), Toast (4 types), Confirmation modal, Skeleton loading. All dark mode ready.' },
  { id:'s1-17', sprint_id:'sp-1', epic_code:'E01', sort_order:17, assignee_code:'dev', day_label:'T2-T3 20-21/4',type:'dev',    status:'todo',        priority:'critical', title:'Dev: Supabase setup + Auth + SSO/LDAP + role routing',                     description:'Cấu hình Supabase, RLS policies, migrations. Auth: Supabase Auth + LDAP/AD cho PTSC M&C. Role-based redirect. 3 test accounts (1 mỗi role).' },
  { id:'s1-18', sprint_id:'sp-1', epic_code:'E02', sort_order:18, assignee_code:'dev', day_label:'T3-T5 21-23/4',type:'dev',    status:'todo',        priority:'critical', title:'Dev: CRUD nhân viên + audit trigger + field visibility middleware',         description:'Migration employees table. CRUD API routes. Audit trigger: mọi INSERT/UPDATE/DELETE tự ghi audit_logs. Field visibility middleware theo role.' },
  { id:'s1-19', sprint_id:'sp-1', epic_code:'E02', sort_order:19, assignee_code:'dev', day_label:'T5-T6 23-24/4',type:'dev',    status:'todo',        priority:'critical', title:'Dev: Import pipeline + validate từng dòng + API Dashboard summary',         description:'Excel/CSV parser, auto column detect, validation engine, line-by-line error aggregation, partial import API. Dashboard summary endpoint: 4 KPI counts.' },
  { id:'s1-20', sprint_id:'sp-1', epic_code:'E01', sort_order:20, assignee_code:'tl',  day_label:'T6 24/4',      type:'doc',    status:'todo',        priority:'critical', title:'API Contracts document: mọi endpoint Sprint 1',                            description:'Document tất cả endpoints: method, request/response schema, error codes. DS và Dev dùng để build UI và API song song Sprint 2.' },
  { id:'s1-21', sprint_id:'sp-1', epic_code:'E01', sort_order:21, assignee_code:'tl',  day_label:'T6 24/4',      type:'review', status:'todo',        priority:'normal',   title:'Code review + Sprint 1 demo + retrospective',                              description:'TL review: RLS policies, audit triggers, no hardcoded secrets. Demo: login 3 roles, CRUD, import, dashboard, audit trail. Retro: blockers, velocity.' },

  // ══ SPRINT 2 — Vị Trí & Bản Đồ Kế Thừa (20 tasks) ══════════════════════
  { id:'s2-01', sprint_id:'sp-2', epic_code:'E03', sort_order:1,  assignee_code:'ba1', day_label:'T2 05/5',      type:'spec',   status:'todo', priority:'critical', title:'Spec Vị Trí Then Chốt: alert + succession depth + AI Backfill',           description:'Vị trí then chốt: alert khi < 2 ứng viên sẵn sàng. Succession depth per position. AI Backfill: fit_score = overall - gap_penalty + idp_bonus - risk_penalty. Top 3 + rationale.' },
  { id:'s2-02', sprint_id:'sp-2', epic_code:'E03', sort_order:2,  assignee_code:'ba1', day_label:'T2 05/5',      type:'spec',   status:'todo', priority:'critical', title:'Spec Bản Đồ Kế Thừa: successor tiers + readiness levels',                 description:'Bản đồ: từng vị trí có danh sách kế thừa với readiness (Now/1-2yr/3-5yr). Tier mapping từ 9-Box. Domino Risk: khi position X trống → chain reaction cascade.' },
  { id:'s2-03', sprint_id:'sp-2', epic_code:'E04', sort_order:3,  assignee_code:'ba1', day_label:'T3 06/5',      type:'spec',   status:'todo', priority:'critical', title:'Spec Assessment: 3 nguồn + weight config + Merged Score',                 description:'3 nguồn: Line Manager (40%), Project (40%), 360° (20%). Config weights per tenant. Merged Score = (Line×wL) + (Project×wP) + (360°×w3). 4 dimensions. Edge: 1-2 nguồn.' },
  { id:'s2-04', sprint_id:'sp-2', epic_code:'E04', sort_order:4,  assignee_code:'ba1', day_label:'T3 06/5',      type:'spec',   status:'todo', priority:'critical', title:'Spec 9-Box: auto-layer sau Calibration lock',                             description:'9-Box từ merged score. Sau khi Calibration lock: Ô 9 → Kế thừa, Ô 6/8 → Tiềm năng cao, Ô 5 → Nòng cốt. Tier thay đổi cần phê duyệt. Edge: mới join < 6 tháng.' },
  { id:'s2-05', sprint_id:'sp-2', epic_code:'E04', sort_order:5,  assignee_code:'ba1', day_label:'T4 07/5',      type:'spec',   status:'todo', priority:'critical', title:'Spec Calibration Room: phiên làm việc + lock + audit',                    description:'Session: tạo phiên, discussion thread per employee, propose move, confirm/reject, lock (immutable sau lock). Trigger auto-layer. Audit trail mọi action.' },
  { id:'s2-06', sprint_id:'sp-2', epic_code:'E04', sort_order:6,  assignee_code:'ba2', day_label:'T2 05/5',      type:'test',   status:'todo', priority:'critical', title:'Test: field visibility lương theo vai trò (3 accounts)',                  description:'HR Admin: lương số thực. Manager: gap%. Employee: ẩn. Test với ít nhất 3 nhân viên, 3 tài khoản khác nhau. Verify không leak qua API response.' },
  { id:'s2-07', sprint_id:'sp-2', epic_code:'E04', sort_order:7,  assignee_code:'ba2', day_label:'T3 06/5',      type:'test',   status:'todo', priority:'critical', title:'Test: Merged Score tính đúng công thức + edge cases',                     description:'Test với data mẫu biết trước kết quả. Thay đổi weights → verify tính lại đúng. Edge: chỉ 1-2 nguồn. Lịch sử: nhiều chu kỳ không ghi đè nhau.' },
  { id:'s2-08', sprint_id:'sp-2', epic_code:'E04', sort_order:8,  assignee_code:'ba2', day_label:'T4 07/5',      type:'test',   status:'todo', priority:'critical', title:'Test: auto-layer 9-Box sau lock + Domino Risk chain',                     description:'Setup Calibration session, lock, verify tier đúng. Verify audit_log. Domino Risk: verify chain reaction khi position trống. Edge: ô manual không auto-layer.' },
  { id:'s2-09', sprint_id:'sp-2', epic_code:'E03', sort_order:9,  assignee_code:'ba2', day_label:'T5 08/5',      type:'test',   status:'todo', priority:'normal',   title:'Test: regression Sprint 1 toàn bộ',                                       description:'Chạy lại tất cả test cases Sprint 1 với production build. Đặc biệt: audit trail, soft delete cascade, SSO không bị break, field visibility đúng.' },
  { id:'s2-10', sprint_id:'sp-2', epic_code:'E03', sort_order:10, assignee_code:'ds',  day_label:'T2 05/5',      type:'design', status:'todo', priority:'critical', title:'Design: Vị Trí Then Chốt — card + alert badge + AI Backfill panel',      description:'Position card: badge mức kế thừa (xanh/vàng/đỏ), alert banner khi thiếu. AI Backfill slide panel từ phải: top 3 candidates + fit score + lý do + nút add.' },
  { id:'s2-11', sprint_id:'sp-2', epic_code:'E03', sort_order:11, assignee_code:'ds',  day_label:'T3 06/5',      type:'design', status:'todo', priority:'critical', title:'Design: Bản Đồ Kế Thừa — succession chain + Domino Risk visual',          description:'Succession chain diagram. Domino Risk: chain reaction visualization. Readiness badges (Now/1-2yr/3-5yr). Interactive: click node → xem profile.' },
  { id:'s2-12', sprint_id:'sp-2', epic_code:'E04', sort_order:12, assignee_code:'ds',  day_label:'T4 07/5',      type:'design', status:'todo', priority:'critical', title:'Design: 9-Box production + Calibration Room',                             description:'9-Box: interactive chips, color-coded quadrants, axis labels, tooltip. Calibration Room: discussion thread, propose/confirm move, lock button với countdown.' },
  { id:'s2-13', sprint_id:'sp-2', epic_code:'E04', sort_order:13, assignee_code:'ds',  day_label:'T5 08/5',      type:'design', status:'todo', priority:'normal',   title:'Design: Assessment form production + lịch sử chu kỳ',                    description:'Assessment form: 3 tabs per nguồn, weight config panel, validation states, loading khi save. Lịch sử: timeline các chu kỳ, so sánh scores.' },
  { id:'s2-14', sprint_id:'sp-2', epic_code:'E03', sort_order:14, assignee_code:'dj',  day_label:'T2-T3 05-06/5',type:'design', status:'todo', priority:'critical', title:'Component: risk badge + succession badge + KPI progress bar',             description:'Risk badge (3 levels), succession readiness badge (3 mức), KPI progress bar với threshold marker. Alert banner component (3 severity, dismissible).' },
  { id:'s2-15', sprint_id:'sp-2', epic_code:'E04', sort_order:15, assignee_code:'dj',  day_label:'T4-T5 07-08/5',type:'design', status:'todo', priority:'normal',   title:'Component: 9-Box chip + Calibration comment thread',                      description:'9-Box employee chip (interactive, draggable), Calibration comment thread (reply, resolve), status indicator animation.' },
  { id:'s2-16', sprint_id:'sp-2', epic_code:'E04', sort_order:16, assignee_code:'dev', day_label:'T2-T4 05-07/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Assessment Engine — 3 nguồn + Merged Score + lịch sử',              description:'Migration assessment_cycles, assessment_scores. Weight config storage per tenant. Server-side merge formula. API: create cycle, add source score, get history. Real-time compute.' },
  { id:'s2-17', sprint_id:'sp-2', epic_code:'E04', sort_order:17, assignee_code:'dev', day_label:'T3-T5 06-08/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: 9-Box engine + Calibration backend + auto-layer trigger',            description:'9-Box computation từ merged scores. Calibration: session management, discussion threads, lock mechanism, Data Freezing (immutable). Auto-layer trigger khi lock.' },
  { id:'s2-18', sprint_id:'sp-2', epic_code:'E03', sort_order:18, assignee_code:'dev', day_label:'T4-T5 07-08/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Succession Map API + AI Backfill algorithm + Domino Risk',           description:'Succession Map: positions với successors list, readiness, gap score. AI Backfill: fit_score formula → top 3 + rationale. Domino Risk chain calculator. Cache 24h.' },
  { id:'s2-19', sprint_id:'sp-2', epic_code:'E03', sort_order:19, assignee_code:'dev', day_label:'T5-T6 08-09/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Tích hợp UI /positions + /talent → real Supabase API',              description:'Thay mock data trong /positions và /talent bằng Supabase calls. Test với 25 nhân viên. Verify field visibility. Đây là 2 trang đầu tiên connect API thật.' },
  { id:'s2-20', sprint_id:'sp-2', epic_code:'E04', sort_order:20, assignee_code:'tl',  day_label:'T6 09/5',      type:'review', status:'todo', priority:'normal',   title:'Code review + Sprint 2 demo + kế hoạch Sprint 3',                        description:'TL review: Assessment accuracy (verify tay), auto-layer correctness, Backfill logic. Demo Sprint 2. Retro + xác nhận scope Sprint 3.' },

  // ══ SPRINT 3 — Tích hợp & UAT Ready (12 tasks) ══════════════════════════
  { id:'s3-01', sprint_id:'sp-3', epic_code:'E03', sort_order:1,  assignee_code:'ba1', day_label:'T2 12/5',      type:'doc',    status:'todo', priority:'critical', title:'Spec seed data: 25 nhân viên PTSC M&C đầy đủ',                           description:'Danh sách 25 nhân viên với đầy đủ: assessment scores, IDP, risk factors, certs, mentoring pairs, succession map. Tên thật/hóa danh theo yêu cầu.' },
  { id:'s3-02', sprint_id:'sp-3', epic_code:'E03', sort_order:2,  assignee_code:'ba1', day_label:'T3-T4 13-14/5',type:'doc',    status:'todo', priority:'critical', title:'Kịch bản UAT: 25 bước, 3 vai trò, pass/fail criteria',                   description:'Script UAT 3 roles: HR Admin (CRUD, succession, calibration), Manager (assessment, IDP approve), Employee (xem profile, IDP). Pass/fail criteria rõ ràng.' },
  { id:'s3-03', sprint_id:'sp-3', epic_code:'E03', sort_order:3,  assignee_code:'ba2', day_label:'T2-T3 12-13/5',type:'test',   status:'todo', priority:'critical', title:'Test case UAT: happy path + edge cases cho khách hàng',                  description:'Happy path 3 roles (8-10 steps mỗi role). Edge cases quan trọng. Tiêu chí pass/fail rõ ràng. Phối hợp với kịch bản UAT BA1.' },
  { id:'s3-04', sprint_id:'sp-3', epic_code:'E03', sort_order:4,  assignee_code:'ba2', day_label:'T4-T5 14-15/5',type:'test',   status:'todo', priority:'normal',   title:'Regression test toàn bộ app (Sprint 1+2+3)',                             description:'Chạy lại tất cả test cases Sprint 1+2 với staging đã tích hợp UI. Ghi bug với severity + reproduction steps.' },
  { id:'s3-05', sprint_id:'sp-3', epic_code:'E03', sort_order:5,  assignee_code:'ds',  day_label:'T2-T3 12-13/5',type:'design', status:'todo', priority:'critical', title:'Design: empty states + skeleton loading + error states toàn app',         description:'Empty states: hình minh họa + action button. Skeleton loading tất cả trang chính. Error: API fail, timeout, unauthorized. Nhất quán toàn app.' },
  { id:'s3-06', sprint_id:'sp-3', epic_code:'E03', sort_order:6,  assignee_code:'ds',  day_label:'T4-T5 14-15/5',type:'design', status:'todo', priority:'critical', title:'Design: Dashboard drill-down + Succession Map interactive',               description:'Dashboard → drill-down vào từng KPI. Succession Map: interactive click node, highlight chain, filter by department.' },
  { id:'s3-07', sprint_id:'sp-3', epic_code:'E03', sort_order:7,  assignee_code:'dj',  day_label:'T2-T5 12-15/5',type:'design', status:'todo', priority:'normal',   title:'Component: responsive + micro-interactions + print mode',                 description:'Responsive: tablet (768-1024px), mobile (<768px). Micro-interactions: transitions, toasts, hover. Print/PDF mode cho hồ sơ nhân viên.' },
  { id:'s3-08', sprint_id:'sp-3', epic_code:'E03', sort_order:8,  assignee_code:'dev', day_label:'T2-T3 12-13/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Tích hợp UI /dashboard + /succession + /calibration → API',          description:'Thay mock data trong /dashboard, /succession, /calibration bằng Supabase calls. Verify với 25 nhân viên thật. Test field visibility sau tích hợp.' },
  { id:'s3-09', sprint_id:'sp-3', epic_code:'E03', sort_order:9,  assignee_code:'dev', day_label:'T3-T4 13-14/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: Seed 25 nhân viên PTSC M&C vào staging',                            description:'Chạy seed script với 25 nhân viên đầy đủ data. Verify mọi trang hiển thị đúng. Đây là data dùng cho UAT 18/05.' },
  { id:'s3-10', sprint_id:'sp-3', epic_code:'E03', sort_order:10, assignee_code:'dev', day_label:'T4-T5 14-15/5',type:'dev',    status:'todo', priority:'critical', title:'Dev: /assessment UI tích hợp + /talent/[id] full profile API',            description:'Tích hợp /assessment với API thật. /talent/[id]: full profile với tất cả tabs (assessment history, IDP, risk factors, certifications, succession map).' },
  { id:'s3-11', sprint_id:'sp-3', epic_code:'E03', sort_order:11, assignee_code:'tl',  day_label:'T5-T6 15-16/5',type:'dev',    status:'todo', priority:'critical', title:'E2E smoke test + sửa critical bugs + đóng băng staging',                 description:'TL chạy smoke test toàn bộ luồng. Fix critical bugs ngay. Deploy staging lần cuối. Không deploy thêm sau T6 16/5. Internal demo kiểm tra trước UAT.' },
  { id:'s3-12', sprint_id:'sp-3', epic_code:'E03', sort_order:12, assignee_code:'tl',  day_label:'T6 16/5',      type:'doc',    status:'todo', priority:'critical', title:'Internal demo UAT prep + hand-off document cho PTSC M&C',                description:'Internal demo full flow trước UAT. Hand-off document: hướng dẫn UAT, tài khoản test, checklist, support contact.' },

  // ══ SPRINT 4 — Fix UAT & IDP & Approval (12 tasks) ══════════════════════
  { id:'s4-01', sprint_id:'sp-4', epic_code:'E05', sort_order:1,  assignee_code:'ba1', day_label:'T2 19/5',      type:'spec',   status:'todo', priority:'critical', title:'Phân loại feedback UAT: critical / UX / feature request',                description:'Sáng 18/5: collect UAT feedback. Chiều: phân loại với TL: P1 bugs (fix ngay), UX (fix nếu < 2h), feature requests (backlog). Assign cho team.' },
  { id:'s4-02', sprint_id:'sp-4', epic_code:'E05', sort_order:2,  assignee_code:'ba1', day_label:'T2-T3 19-20/5',type:'spec',   status:'todo', priority:'critical', title:'Spec IDP: nháp + 3 loại hoạt động + phê duyệt 3 cấp',                   description:'IDP draft status (lưu khi chưa đủ). 3 loại: thực tế 70%, kèm cặp 20%, đào tạo chính quy 10%. Approval flow: Manager → TCNS → Ban PTNT.' },
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
