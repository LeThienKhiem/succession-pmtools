// Static mock data v3 — sourced from tasks-export-v3.json
// 80 tasks, 8 epics, 5 sprints. Sprint 3–5 now have real tasks.

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
  { id: 'ms-1', order: 1, date: '2026-04-20', title: 'Khởi động Dự án (Kick-off)', description: 'Chốt đội ngũ DEV/QC và thống nhất quy trình làm việc.', is_done: false },
  { id: 'ms-2', order: 2, date: '2026-04-24', title: 'Foundation & Auth deployed', description: 'Login 3 roles + SSO/LDAP + Employee CRUD + audit trail.', is_done: false },
  { id: 'ms-3', order: 3, date: '2026-05-09', title: 'Assessment Engine hoàn thành', description: 'Assessment 3 sources, auto-layering, Calibration Room, Backfill AI.', is_done: false },
  { id: 'ms-4', order: 4, date: '2026-05-16', title: 'IDP + Approval + Mentoring xong', description: 'IDP Draft + 8-cấp Approval + Gatekeeping + Mentoring pairs.', is_done: false },
  { id: 'ms-5', order: 5, date: '2026-05-23', title: 'AI + Reports tích hợp', description: 'AI Career Path, Domino Risk, Succession Simulation, Kirkpatrick.', is_done: false },
  { id: 'ms-6', order: 6, date: '2026-05-30', title: 'Staging frozen — Zero critical bugs', description: 'Full regression, demo run-through, stakeholder preview.', is_done: false },
  { id: 'ms-7', order: 7, date: '2026-05-31', title: 'BOD Demo Day', description: 'Demo toàn bộ hệ thống cho Ban Giám đốc.', is_done: false },
]

export interface TeamMember {
  id: string
  code: string
  name: string
  role: string
  color: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-01', code: 'lk',       name: 'Lê Khiêm',       role: 'Project Manager',   color: '#1D9E75' },
  { id: 'tm-02', code: 'tl',       name: 'Tech Lead',       role: 'Tech Lead',         color: '#BA7517' },
  { id: 'tm-03', code: 'ba1',      name: 'BA1',             role: 'Business Analyst',  color: '#378ADD' },
  { id: 'tm-04', code: 'ba2',      name: 'BA2',             role: 'Business Analyst',  color: '#639922' },
  { id: 'tm-05', code: 'ds',       name: 'Designer Senior', role: 'Designer',          color: '#7F77DD' },
  { id: 'tm-06', code: 'dj',       name: 'Designer Junior', role: 'Designer',          color: '#9B59B6' },
  { id: 'tm-07', code: 'lead_dev', name: 'Lead Dev + Team', role: 'Developer',         color: '#D85A30' },
]

// E01-E08 per tasks-export-v3.json
export const EPICS = [
  { id: 'ep-01', code: 'E01', name: 'Nền tảng & Xác thực',   sprint_id: 'sp-1', color: '#4F46E5' },
  { id: 'ep-02', code: 'E02', name: 'Quản lý nhân viên',      sprint_id: 'sp-1', color: '#0EA5E9' },
  { id: 'ep-03', code: 'E03', name: 'Đánh giá & 9-Box',       sprint_id: 'sp-2', color: '#10B981' },
  { id: 'ep-04', code: 'E04', name: 'IDP & Phê duyệt',        sprint_id: 'sp-3', color: '#8B5CF6' },
  { id: 'ep-05', code: 'E05', name: 'Tích hợp UI',            sprint_id: 'sp-2', color: '#F59E0B' },
  { id: 'ep-06', code: 'E06', name: 'AI & Báo cáo',           sprint_id: 'sp-5', color: '#6B7280' },
  { id: 'ep-07', code: 'E07', name: 'Tính năng nâng cao',     sprint_id: 'sp-4', color: '#EC4899' },
  { id: 'ep-08', code: 'E08', name: 'Demo BOD',               sprint_id: 'sp-3', color: '#14B8A6' },
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
  pre_holiday?: boolean
}

export const SPRINTS = [
  {
    id: 'sp-1', name: 'Sprint 1', theme: 'Nền tảng + Xác thực + Nhân viên',
    start_date: '2026-04-20', end_date: '2026-04-24',
    status: 'active' as SprintStatus, progress_percent: 5,
    epics: ['E01 · Nền tảng & Xác thực', 'E02 · Quản lý nhân viên'],
  },
  {
    id: 'sp-2', name: 'Sprint 2', theme: 'Đánh giá + 9-Box + APIs',
    start_date: '2026-05-05', end_date: '2026-05-09',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E03 · Đánh giá & 9-Box', 'E05 · Tích hợp UI'],
  },
  {
    id: 'sp-3', name: 'Sprint 3', theme: 'Tích hợp UI + IDP + Hoàn thiện',
    start_date: '2026-05-12', end_date: '2026-05-16',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E04 · IDP & Phê duyệt', 'E05 · Tích hợp UI', 'E08 · Demo BOD'],
  },
  {
    id: 'sp-4', name: 'Sprint 4', theme: 'Sửa UAT + Tính năng nâng cao',
    start_date: '2026-05-19', end_date: '2026-05-23',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E07 · Tính năng nâng cao', 'E08 · Demo BOD'],
  },
  {
    id: 'sp-5', name: 'Sprint 5', theme: 'AI + Báo cáo + Chuẩn bị BOD',
    start_date: '2026-05-26', end_date: '2026-05-30',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E06 · AI & Báo cáo', 'E08 · Demo BOD'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// ALL 80 TASKS from tasks-export-v3.json
// Status: dang_lam → in-progress | chua_lam → todo
// Priority: critical | priority | normal
// ─────────────────────────────────────────────────────────────────────────────
export const TASKS: Task[] = [

  // ══ SPRINT 1 — 20/4 → 24/4 (21 tasks) ═══════════════════════════════════
  {
    id: 's1-01', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Thiết kế schema DB: nhân viên, tenant, vai trò, audit_logs',
    description: 'Spec đầy đủ 8 bảng đầu tiên: tên field, kiểu dữ liệu, bắt buộc/tùy chọn, quan hệ khóa ngoại, indexes. Xác nhận quy ước đặt tên và chiến lược RLS với Tech Lead trước khi dev migrate.',
    assignee_code: 'ba1', day_label: 'T2 20/4', type: 'spec', status: 'in-progress', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's1-02', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Spec bảng audit_logs: ai, khi nào, cái gì, lý do',
    description: 'Thiết kế bảng ghi lịch sử thay đổi: table_name, record_id, người thực hiện, thời điểm, hành động, giá trị cũ/mới (jsonb), lý do. Trigger gắn vào mọi bảng nhạy cảm. Bắt buộc theo Điều 7.',
    assignee_code: 'ba1', day_label: 'T2 20/4', type: 'spec', status: 'in-progress', priority: 'critical', estimated_hours: 2,
  },
  {
    id: 's1-03', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Ma trận hiển thị trường: lương và dữ liệu nhạy cảm theo vai trò',
    description: 'Bảng quyết định từng field: HR Admin, Ban PTNT, Quản lý, Nhân viên thấy gì. Lương thực (chỉ HR), chênh lệch lương % (Quản lý xem), yếu tố rủi ro thị trường (chỉ khi module bật).',
    assignee_code: 'ba1', day_label: 'T3 21/4', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's1-04', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Spec chặn cứng đồng ý xử lý dữ liệu cá nhân',
    description: 'Luồng theo Điều 21: checkbox bắt buộc tick trước khi gửi bất kỳ biểu mẫu nào. Nút Gửi bị vô hiệu hóa cho đến khi xác nhận. Lưu timestamp và user_id vào audit_log.',
    assignee_code: 'ba1', day_label: 'T3 21/4', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 2,
  },
  {
    id: 's1-05', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Spec nhập liệu: ánh xạ cột + báo lỗi từng dòng',
    description: 'Spec pipeline nhập: định dạng xlsx/csv, tự động nhận diện cột, quy tắc kiểm tra, báo lỗi từng dòng (số dòng + trường + thông báo), nhập một phần với xác nhận người dùng.',
    assignee_code: 'ba1', day_label: 'T4 22/4', type: 'spec', status: 'todo', priority: 'priority', estimated_hours: 3,
  },
  {
    id: 's1-06', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Quy tắc nghiệp vụ CRUD nhân viên',
    description: 'Trường bắt buộc khi tạo mới vs tùy chọn. Hiệu ứng xóa mềm (cascade). Quy tắc trigger audit log. Logic phát hiện trùng lặp.',
    assignee_code: 'ba1', day_label: 'T5 23/4', type: 'spec', status: 'todo', priority: 'normal', estimated_hours: 3,
  },
  {
    id: 's1-07', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'User story: luồng xác thực (đăng nhập, SSO, chuyển hướng)',
    description: 'Story cho: đăng nhập email/mật khẩu, SSO, quên mật khẩu, chuyển hướng theo vai trò. AC: sai mật khẩu, tài khoản bị khóa, hết phiên làm việc.',
    assignee_code: 'ba2', day_label: 'T2 20/4', type: 'story', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's1-08', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'User story: CRUD nhân viên + nhập file Excel/CSV',
    description: 'Story cho: thêm/sửa/xóa nhân viên, nhập Excel/CSV, hiển thị lỗi từng dòng. AC: email trùng, thiếu trường bắt buộc, sai định dạng ngày.',
    assignee_code: 'ba2', day_label: 'T3 21/4', type: 'story', status: 'todo', priority: 'normal', estimated_hours: 3,
  },
  {
    id: 's1-09', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Test case: xác thực + LDAP + phân quyền theo vai trò',
    description: 'Test: đăng nhập thành công/thất bại, SSO, LDAP của PTSC M&C, chuyển hướng theo vai trò, hết phiên, đăng xuất. Quyền: menu hiển thị theo vai trò. Trường hợp âm: bị từ chối truy cập.',
    assignee_code: 'ba2', day_label: 'T4 22/4', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's1-10', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Test case: CRUD nhân viên + nhập file',
    description: 'CRUD: tạo (thành công, trùng, thiếu bắt buộc), xem (lọc/sắp xếp), sửa (một phần, lương theo vai trò), xóa mềm cascade. Nhập: file hợp lệ, lỗi hỗn hợp, sai định dạng, file rỗng.',
    assignee_code: 'ba2', day_label: 'T5 23/4', type: 'test', status: 'todo', priority: 'normal', estimated_hours: 3,
  },
  {
    id: 's1-11', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Trang đăng nhập production + SSO + 3 biến thể vai trò',
    description: 'Trang đăng nhập chuyên nghiệp: logo PTSC M&C, trường email+mật khẩu, nút SSO, quên mật khẩu. 3 màn hình landing page sau đăng nhập theo từng vai trò.',
    assignee_code: 'ds', day_label: 'T2 20/4', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's1-12', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Khung giao diện HR Admin: sidebar, header, breadcrumb',
    description: 'Sidebar navigation 4 nhóm, header hiển thị tên tenant + avatar + đăng xuất, breadcrumb, khu vực nội dung chính. Production-ready, hỗ trợ dark mode.',
    assignee_code: 'ds', day_label: 'T3 21/4', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 4,
  },
  {
    id: 's1-13', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Danh sách nhân viên + luồng nhập file + hiển thị lỗi từng dòng',
    description: 'Danh sách: tìm kiếm, bộ lọc, sắp xếp, nút nhập. Luồng nhập: upload → ánh xạ cột → bảng lỗi validation → xác nhận. Hiển thị lỗi từng dòng là điểm then chốt.',
    assignee_code: 'ds', day_label: 'T4 22/4', type: 'design', status: 'todo', priority: 'priority', estimated_hours: 5,
  },
  {
    id: 's1-14', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Hồ sơ nhân viên: chế độ xem + chỉnh sửa production',
    description: 'Chế độ xem: 91 trường tổ chức theo tab. Chỉnh sửa: trường lương 2 biến thể theo vai trò. Nhập tag yếu tố rủi ro. Nâng cấp từ prototype lên production.',
    assignee_code: 'ds', day_label: 'T5-T6 23-24/4', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 6,
  },
  {
    id: 's1-15', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Thư viện component: nút, badge, avatar + xuất design token',
    description: 'Build Figma production: Button (4 biến thể × 4 trạng thái), Badge (6 loại), Avatar (kích cỡ). Input, Select, Date picker, Textarea — đầy đủ trạng thái. Xuất design tokens đồng bộ Tailwind config.',
    assignee_code: 'dj', day_label: 'T2-T5 20-23/4', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 12,
  },
  {
    id: 's1-16', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Component phản hồi: toast, modal, dialog xác nhận, banner lỗi',
    description: 'Toast (4 loại), Modal, Dialog xác nhận, Banner lỗi. Trạng thái rỗng, skeleton loading. Tất cả dark mode ready.',
    assignee_code: 'dj', day_label: 'T6 24/4', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 3,
  },
  {
    id: 's1-17', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Thiết lập Supabase + Xác thực + SSO/LDAP + định tuyến vai trò',
    description: 'Cấu hình Supabase, chính sách RLS, migrations. Auth: Supabase Auth + LDAP/AD cho PTSC M&C. Logic chuyển hướng theo vai trò. 3 tài khoản test (1 mỗi vai trò).',
    assignee_code: 'lead_dev', day_label: 'T2-T3 20-21/4', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 10,
  },
  {
    id: 's1-18', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'CRUD nhân viên + trigger audit + middleware phân quyền trường',
    description: 'Migration bảng employees. API routes CRUD. Trigger audit: mọi INSERT/UPDATE/DELETE tự ghi audit_logs. Middleware hiển thị trường theo vai trò.',
    assignee_code: 'lead_dev', day_label: 'T3-T5 21-23/4', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 10,
  },
  {
    id: 's1-19', sprint_id: 'sp-1', epic_code: 'E02',
    title: 'Pipeline nhập file + kiểm tra từng dòng',
    description: 'Parser Excel/CSV, tự động nhận diện cột, engine kiểm tra, tổng hợp lỗi từng dòng, API nhập một phần. Test với file mẫu có lỗi hỗn hợp.',
    assignee_code: 'lead_dev', day_label: 'T5-T6 23-24/4', type: 'dev', status: 'todo', priority: 'priority', estimated_hours: 6,
  },
  {
    id: 's1-20', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Tài liệu API Contracts',
    description: 'Document tất cả endpoints: phương thức, schema request/response, mã lỗi. DS và Lead Dev dùng tài liệu này để build UI và API song song trong Sprint 2.',
    assignee_code: 'tl', day_label: 'T6 24/4', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's1-21', sprint_id: 'sp-1', epic_code: 'E01',
    title: 'Review code + demo Sprint 1 + retro',
    description: 'TL review: chính sách RLS đúng chưa, trigger audit hoạt động chưa, không hardcode secret. Demo 3 vai trò, CRUD, nhập file, audit trail. Retro: ghi nhận blockers, velocity thực tế, điều chỉnh Sprint 2.',
    assignee_code: 'tl', day_label: 'T6 24/4', type: 'review', status: 'todo', priority: 'normal', estimated_hours: 3,
  },

  // ══ SPRINT 2 — 05/5 → 09/5 (21 tasks) ════════════════════════════════════
  {
    id: 's2-01', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Spec Đánh giá: 3 nguồn + cấu hình trọng số',
    description: '3 nguồn (Quản lý trực tiếp 40%, Dự án 40%, 360° 20%). Cấu hình trọng số per tenant (tổng = 100%). 4 chiều per nguồn. Schema bảng assessment_sources.',
    assignee_code: 'ba1', day_label: 'Nghỉ lễ', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 4, pre_holiday: true,
  },
  {
    id: 's2-02', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Spec công thức hợp nhất điểm năng lực',
    description: 'Điểm hợp nhất = (Line×wL) + (Dự án×wP) + (360×w3) per chiều. Overall = tech×0.4 + perf×0.3 + beh×0.2 + pot×0.1. Xử lý edge case: chỉ có 1-2 nguồn.',
    assignee_code: 'ba1', day_label: 'Nghỉ lễ', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3, pre_holiday: true,
  },
  {
    id: 's2-03', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Spec phân tầng tự động: ô 9-Box → tầng nhân sự',
    description: 'Sau khi Calibration khóa: Ô 9 → Kế thừa, Ô 6/8 → Tiềm năng cao, Ô 4/7 → Tiềm năng, Ô 5 → Nòng cốt. Edge: mới vào dưới 6 tháng không tự phân tầng. Thay đổi tầng cần phê duyệt.',
    assignee_code: 'ba1', day_label: 'Nghỉ lễ', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3, pre_holiday: true,
  },
  {
    id: 's2-04', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Spec đánh giá theo mốc dự án',
    description: 'Trigger khi nhân viên kết thúc vai trò tại dự án trọng điểm (Điều 17). Tự tạo yêu cầu đánh giá gửi Quản lý dự án, deadline 14 ngày. Kết quả hợp nhất vào hồ sơ như thế nào.',
    assignee_code: 'ba1', day_label: 'Nghỉ lễ', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3, pre_holiday: true,
  },
  {
    id: 's2-05', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Spec Bản đồ kế thừa + Gợi ý AI điền vị trí trống',
    description: 'Thuật toán fit_score: overall_score - gap_penalty + idp_bonus - risk_penalty. Top 3 ứng viên per vị trí trống. Text lý do 1 câu. API endpoint + UI slide panel.',
    assignee_code: 'ba1', day_label: 'T2 05/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's2-06', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Spec Phòng Hiệu chỉnh + Đóng băng dữ liệu',
    description: 'Tạo phiên, luồng thảo luận, đề xuất di chuyển, xác nhận/từ chối, khóa (bất biến sau khi khóa), audit trail mọi hành động. Trigger phân tầng tự động.',
    assignee_code: 'ba1', day_label: 'T3 06/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's2-07', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Test: hiển thị trường theo vai trò (lương số thực vs %)',
    description: 'HR Admin: lương số thực. Quản lý: chênh lệch %. Nhân viên: ẩn hoàn toàn. Test ít nhất 3 nhân viên với 3 tài khoản khác nhau.',
    assignee_code: 'ba2', day_label: 'T2 05/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 2,
  },
  {
    id: 's2-08', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Test: tính toán hợp nhất 3 nguồn đánh giá',
    description: 'Test với data mẫu đã biết kết quả. Thay đổi trọng số, verify tính lại đúng. Edge case: chỉ có 1 nguồn. Test lịch sử: nhiều chu kỳ không ghi đè nhau.',
    assignee_code: 'ba2', day_label: 'T3 06/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's2-09', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Test: trigger phân tầng tự động từ 9-Box',
    description: 'Setup phiên Calibration, khóa, verify nhân viên được gán đúng tầng. Verify ghi audit_log với lý do. Verify thông báo. Edge: ô cần review thủ công không tự phân tầng.',
    assignee_code: 'ba2', day_label: 'T4 07/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 2,
  },
  {
    id: 's2-10', sprint_id: 'sp-2', epic_code: 'E02',
    title: 'Kiểm thử hồi quy Sprint 1',
    description: 'Chạy lại toàn bộ test Sprint 1 với bản production. Đặc biệt: audit trail, xóa mềm cascade, SSO không bị ảnh hưởng, hiển thị trường đúng sau thêm tính năng mới.',
    assignee_code: 'ba2', day_label: 'T5 08/5', type: 'test', status: 'todo', priority: 'normal', estimated_hours: 3,
  },
  {
    id: 's2-11', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Thiết kế form Đánh giá (chuyển từ prototype sang production)',
    description: 'Nâng cấp prototype /assessment: thêm trạng thái validation, loading khi lưu, dialog xác nhận khi đổi trọng số, link xem lịch sử. Không thiết kế lại từ đầu.',
    assignee_code: 'ds', day_label: 'T2 05/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's2-12', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Thiết kế 9-Box production + Phòng Hiệu chỉnh',
    description: '9-Box: chip tương tác, màu gradient theo quadrant, trục rõ ràng, tooltip. Phòng Hiệu chỉnh: chuyển thể từ prototype, thêm luồng thảo luận production, nút khóa với đếm ngược.',
    assignee_code: 'ds', day_label: 'T3 06/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 5,
  },
  {
    id: 's2-13', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Thiết kế thẻ vị trí kế thừa + panel Gợi ý AI',
    description: 'Thẻ vị trí: badge mức độ kế thừa (xanh/vàng/đỏ), banner cảnh báo, badge độ khó thay thế. Panel AI slide từ phải: top 3 ứng viên + fit score + lý do + nút thêm vào kế thừa.',
    assignee_code: 'ds', day_label: 'T4 07/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's2-14', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Thiết kế Dashboard Mật độ Kế thừa',
    description: "2 KPI card mới: 'Vị trí có ≥2 ứng viên sẵn sàng: X/12' và 'Vị trí cần bổ sung gấp: Y'. Progress bar per vị trí với marker ngưỡng tối thiểu.",
    assignee_code: 'ds', day_label: 'T5 08/5', type: 'design', status: 'todo', priority: 'priority', estimated_hours: 3,
  },
  {
    id: 's2-15', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Hoàn thiện UI: yếu tố rủi ro + badge kế thừa + thẻ KPI cảnh báo',
    description: 'Yếu tố rủi ro: tag có nút xóa, thêm custom, icon phân biệt nội bộ/thị trường. Badge kế thừa: 3 mức độ sẵn sàng. Thẻ KPI stat: số lớn + label + màu cảnh báo.',
    assignee_code: 'dj', day_label: 'T2-T3 05-06/5', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 6,
  },
  {
    id: 's2-16', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Banner cảnh báo vị trí + thẻ KPI Mật độ Kế thừa',
    description: 'Component Banner cảnh báo (3 mức độ nghiêm trọng, có thể đóng, slot nút hành động). Component thẻ stat KPI. Progress bar với marker ngưỡng. Dùng lại nhiều trang.',
    assignee_code: 'dj', day_label: 'T4-T5 07-08/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's2-17', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Xây dựng Assessment Engine: 3 nguồn + công thức hợp nhất',
    description: 'Migration bảng assessment_sources. Lưu trữ cấu hình trọng số per tenant. Tính toán hợp nhất phía server. API: tạo chu kỳ, thêm điểm nguồn, lấy lịch sử. Tính toán real-time.',
    assignee_code: 'lead_dev', day_label: 'T2-T4 05-07/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 10,
  },
  {
    id: 's2-18', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Tự động phân tầng + trigger đánh giá mốc dự án',
    description: 'Event listener khi calibration_sessions.status = "locked". Bulk update talent_tier_history. Cron job daily phát hiện project_assignments kết thúc → tạo assessment_request → gửi email. Deadline 14 ngày.',
    assignee_code: 'lead_dev', day_label: 'T3-T5 06-08/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 8,
  },
  {
    id: 's2-19', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'API 9-Box + Bản đồ Kế thừa + Gợi ý AI điền chỗ trống',
    description: 'Tính 9-Box từ merged score (25 nhân viên). API Bản đồ Kế thừa với danh sách ứng viên. Thuật toán Backfill: fit_score → top 3. Chỉ số Phụ thuộc (< 2 sẵn sàng = đỏ). Cache 24h.',
    assignee_code: 'lead_dev', day_label: 'T4-T5 07-08/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 8,
  },
  {
    id: 's2-20', sprint_id: 'sp-2', epic_code: 'E05',
    title: 'Tích hợp UI: /nhan-tai và /vi-tri → real API',
    description: 'Thay thế mock data trong /talent và /positions bằng Supabase calls. Test với 25 nhân viên thật. Đây là 2 trang đầu tiên kết nối API thật. Verify field visibility hoạt động.',
    assignee_code: 'lead_dev', day_label: 'T5-T6 08-09/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 5,
  },
  {
    id: 's2-21', sprint_id: 'sp-2', epic_code: 'E03',
    title: 'Review code + demo Sprint 2 + lên kế hoạch Sprint 3',
    description: 'TL review: độ chính xác công thức Assessment (verify tay), tính đúng của phân tầng, logic thuật toán Backfill. Demo Sprint 2. Retro + xác nhận scope Sprint 3.',
    assignee_code: 'tl', day_label: 'T6 09/5', type: 'review', status: 'todo', priority: 'normal', estimated_hours: 3,
  },

  // ══ SPRINT 3 — 12/5 → 16/5 (14 tasks) ════════════════════════════════════
  {
    id: 's3-01', sprint_id: 'sp-3', epic_code: 'E04',
    title: 'Spec IDP đơn giản: nháp + 3 loại hoạt động + phê duyệt 3 cấp',
    description: 'IDP trạng thái nháp (lưu khi chưa đủ thông tin). 3 loại hoạt động: thực tế (70%), kèm cặp (20%), đào tạo chính quy (10%). Luồng phê duyệt: Quản lý → TCNS → Ban PTNT.',
    assignee_code: 'ba1', day_label: 'T2 12/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's3-02', sprint_id: 'sp-3', epic_code: 'E08',
    title: 'Kịch bản UAT: 25 bước luồng cho khách hàng thực hiện',
    description: 'Script UAT 3 vai trò: HR Admin (quản lý nhân viên, đánh giá, kế thừa), Quản lý (nhập điểm, duyệt IDP), Nhân viên (tạo IDP, xem hồ sơ). Tiêu chí pass/fail rõ ràng.',
    assignee_code: 'ba1', day_label: 'T3 13/5', type: 'doc', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's3-03', sprint_id: 'sp-3', epic_code: 'E08',
    title: 'Spec dữ liệu seed: 25 nhân viên PTSC M&C đầy đủ',
    description: 'Danh sách 25 nhân viên với đầy đủ: điểm đánh giá, IDP, yếu tố rủi ro, chứng chỉ, cặp kèm cặp, bản đồ kế thừa. Dùng tên thật/hóa danh theo yêu cầu.',
    assignee_code: 'ba1', day_label: 'T4 14/5', type: 'doc', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's3-04', sprint_id: 'sp-3', epic_code: 'E04',
    title: 'Test: lưu nháp IDP + gửi phê duyệt + đồng ý dữ liệu',
    description: 'Test: lưu nháp không cần đủ trường. Gửi phê duyệt bị chặn nếu chưa tick consent. Luồng phê duyệt 3 cấp: gửi → thông báo → duyệt/từ chối. Ghi audit log mỗi bước.',
    assignee_code: 'ba2', day_label: 'T2 12/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's3-05', sprint_id: 'sp-3', epic_code: 'E05',
    title: 'Kiểm thử hồi quy toàn bộ app',
    description: 'Chạy lại tất cả test Sprint 1+2 với bản staging đã tích hợp UI. Đặc biệt: xác thực, CRUD, assessment, bản đồ kế thừa. Ghi bug với severity + reproduction steps.',
    assignee_code: 'ba2', day_label: 'T3-T4 13-14/5', type: 'test', status: 'todo', priority: 'normal', estimated_hours: 6,
  },
  {
    id: 's3-06', sprint_id: 'sp-3', epic_code: 'E08',
    title: 'Test case UAT: luồng thành công + edge case cho khách hàng',
    description: 'Hoàn thiện test case UAT: happy path mỗi vai trò (3 roles × 8-10 steps), edge cases quan trọng, tiêu chí pass/fail rõ ràng. Phối hợp với kịch bản UAT của BA1.',
    assignee_code: 'ba2', day_label: 'T5 15/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's3-07', sprint_id: 'sp-3', epic_code: 'E04',
    title: 'Thiết kế IDP production: wizard + tab 70-20-10',
    description: 'Wizard IDP: trạng thái nháp + gửi duyệt. Tab 70-20-10: hoạt động với type badge, progress bar. Modal thêm nhiệm vụ thử thách. Stepper phê duyệt + checkbox đồng ý dữ liệu hard-stop.',
    assignee_code: 'ds', day_label: 'T2-T3 12-13/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 6,
  },
  {
    id: 's3-08', sprint_id: 'sp-3', epic_code: 'E05',
    title: 'Trạng thái rỗng + skeleton loading + trạng thái lỗi toàn app',
    description: 'Empty states: khi chưa có data (hình minh họa + nút hành động). Loading skeleton: tất cả trang chính. Error states: lỗi API, timeout, unauthorized. Nhất quán toàn app.',
    assignee_code: 'ds', day_label: 'T4-T5 14-15/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 6,
  },
  {
    id: 's3-09', sprint_id: 'sp-3', epic_code: 'E05',
    title: 'Tích hợp UI IDP: thẻ hoạt động + progress bar Stretch Assignment',
    description: 'Thẻ hoạt động stretch: badge loại (6 màu), progress bar theo completion%, status dot animation. Tab 70-20-10 component. Dùng lại nhiều trang.',
    assignee_code: 'dj', day_label: 'T2-T3 12-13/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 5,
  },
  {
    id: 's3-10', sprint_id: 'sp-3', epic_code: 'E05',
    title: 'Responsive + micro-interaction + chế độ in',
    description: 'Responsive: tablet (768-1024px), mobile (<768px). Micro-interactions: transitions, toasts, hover states. Chế độ xem in/xuất PDF cho hồ sơ nhân viên.',
    assignee_code: 'dj', day_label: 'T4-T5 14-15/5', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 5,
  },
  {
    id: 's3-11', sprint_id: 'sp-3', epic_code: 'E05',
    title: 'Tích hợp UI: /danh-gia + /ket-thua + /hiệu-chinh → API thật',
    description: 'Thay thế mock data trong /assessment, /succession, /calibration bằng Supabase calls. Verify với 25 nhân viên thật. Test field visibility sau tích hợp.',
    assignee_code: 'lead_dev', day_label: 'T2-T3 12-13/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 8,
  },
  {
    id: 's3-12', sprint_id: 'sp-3', epic_code: 'E04',
    title: 'Tích hợp UI IDP + CRUD + phê duyệt 3 cấp',
    description: 'Thay thế mock data /idp. IDP CRUD: tạo nháp, thêm hoạt động 3 loại, tự tính progress. Luồng phê duyệt: gửi → thông báo email → duyệt/từ chối cấp 1 → 2 → 3.',
    assignee_code: 'lead_dev', day_label: 'T3-T4 13-14/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 8,
  },
  {
    id: 's3-13', sprint_id: 'sp-3', epic_code: 'E08',
    title: 'Seed 25 nhân viên PTSC M&C vào staging + kiểm tra toàn bộ',
    description: 'Chạy seed script với 25 nhân viên đầy đủ data: assessments, IDP, risk factors, certs, mentoring, succession map. Kiểm tra mọi trang hiển thị đúng. Đây là dữ liệu dùng cho UAT.',
    assignee_code: 'lead_dev', day_label: 'T4-T5 14-15/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 6,
  },
  {
    id: 's3-14', sprint_id: 'sp-3', epic_code: 'E08',
    title: 'Kiểm tra end-to-end + sửa bug critical + đóng băng staging',
    description: 'TL chạy smoke test toàn bộ luồng. Fix critical bugs ngay. Deploy staging lần cuối. Không deploy thêm sau T6 16/5. Internal demo kiểm tra trước UAT.',
    assignee_code: 'tl', day_label: 'T5-T6 15-16/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 5,
  },

  // ══ SPRINT 4 — 19/5 → 23/5 (12 tasks) ════════════════════════════════════
  {
    id: 's4-01', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Phân loại feedback UAT: critical vs cần cải thiện',
    description: 'Sáng 18/5: collect feedback UAT. Chiều: phân loại với TL: critical bugs (phải sửa trước mọi thứ), UX feedback (sửa nếu < 2h), feature requests (backlog sau BOD). Assign cho team ngay.',
    assignee_code: 'ba1', day_label: 'T2 19/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 3,
  },
  {
    id: 's4-02', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Spec Phê duyệt đa cấp: 8 cấp cấu hình linh hoạt',
    description: 'Workflow Engine: Admin cấu hình số cấp (1-8) và người duyệt per loại yêu cầu. Chuỗi phê duyệt: gửi → thông báo cấp 1 → duyệt/từ chối → cấp 2 → ... → quyết định cuối. Deadline per cấp, tự leo thang khi quá hạn.',
    assignee_code: 'ba1', day_label: 'T2-T3 19-20/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's4-03', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Spec Chặn cổng IDP + Phiên bản IDP',
    description: 'Gatekeeping (Điều 137): nếu điểm < 80% → IDP tự chuyển "tạm dừng", thông báo quản lý. IDP Versioning: mỗi lần duyệt tạo version mới (v1, v2...). Yêu cầu thay đổi → luồng phê duyệt rút gọn → version mới.',
    assignee_code: 'ba1', day_label: 'T3-T4 20-21/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's4-04', sprint_id: 'sp-4', epic_code: 'E08',
    title: 'Kịch bản demo BOD: 25 phút từng bước click',
    description: 'Script demo 25 phút: /vi-tri (cảnh báo + backfill) → /nhan-tai/emp-006 (rủi ro + audit) → /danh-gia (3 nguồn) → /hieu-chinh (khóa) → /bao-cao (ROI). Câu trả lời cho 3 câu BOD hay hỏi nhất.',
    assignee_code: 'ba1', day_label: 'T4-T5 21-22/5', type: 'doc', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's4-05', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Document và test tất cả bug từ UAT',
    description: 'Document chi tiết mọi bug UAT: mô tả, reproduction steps, screenshot, severity (P1/P2/P3). Test lại sau khi dev fix. Confirm với khách hàng nếu cần.',
    assignee_code: 'ba2', day_label: 'T2-T3 19-20/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 5,
  },
  {
    id: 's4-06', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Test: Phê duyệt đa cấp 8 cấp + Chặn cổng IDP',
    description: 'Test phê duyệt: cấu hình 3 cấp/5 cấp/8 cấp, verify chuỗi thông báo đúng, auto-escalate khi quá deadline. Test gatekeeping: assessment < 80% → IDP tạm dừng tự động.',
    assignee_code: 'ba2', day_label: 'T4-T5 21-22/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's4-07', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'UI Phê duyệt đa cấp (stepper 8 cấp) + Phòng Kèm cặp',
    description: 'Stepper phê duyệt 8 cấp: visual trạng thái từng cấp, người duyệt, deadline, comment. Trang Kèm cặp production: danh sách cặp + log-book timeline + form thêm buổi.',
    assignee_code: 'ds', day_label: 'T2-T3 19-20/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 6,
  },
  {
    id: 's4-08', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'UI Phiên bản IDP + Phòng Hiệu chỉnh production',
    description: 'Panel lịch sử phiên bản IDP (timeline version cũ). Phòng Hiệu chỉnh production: drag-drop chip, luồng comment + xác nhận, nút khóa. Khác biệt rõ với /bản-đồ-kế-thừa.',
    assignee_code: 'ds', day_label: 'T3-T5 20-22/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 6,
  },
  {
    id: 's4-09', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'UI Chặn cổng IDP + KTP danh mục tri thức',
    description: 'Trạng thái IDP "tạm dừng": visual cảnh báo, thông báo quản lý, yêu cầu tư vấn trước khi tiếp tục. Danh sách tri thức KTP: 4 loại, mức độ quan trọng, tiến độ chuyển giao.',
    assignee_code: 'dj', day_label: 'T2-T4 19-21/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 5,
  },
  {
    id: 's4-10', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Sửa toàn bộ bug critical từ UAT',
    description: 'Fix tất cả bugs priority P1 từ UAT 18/5. Không thêm tính năng mới cho đến khi hết P1. Deploy từng fix lên staging và verify ngay.',
    assignee_code: 'lead_dev', day_label: 'T2-T3 19-20/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 10,
  },
  {
    id: 's4-11', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Workflow Engine phê duyệt đa cấp 8 cấp + Chặn cổng IDP',
    description: 'Workflow Engine: cấu hình số cấp + người duyệt per loại. Chuỗi thông báo. Auto-escalate khi quá hạn. Gatekeeping trigger: monitor assessment score → pause IDP → notify → yêu cầu tư vấn.',
    assignee_code: 'lead_dev', day_label: 'T2-T5 19-22/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 12,
  },
  {
    id: 's4-12', sprint_id: 'sp-4', epic_code: 'E07',
    title: 'Phiên bản IDP + CRUD Kèm cặp + Backend Phòng Hiệu chỉnh',
    description: 'IDP versioning: version mới mỗi lần approve, archive version cũ. Mentoring: CRUD cặp + log phiên + theo dõi giờ. Calibration backend: quản lý phiên, luồng thảo luận, cơ chế khóa, audit trail.',
    assignee_code: 'lead_dev', day_label: 'T3-T6 20-23/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 10,
  },

  // ══ SPRINT 5 — 26/5 → 30/5 (12 tasks) ════════════════════════════════════
  {
    id: 's5-01', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'Spec Lộ trình Nghề nghiệp AI + Explainable AI',
    description: 'Tích hợp Claude API: prompt engineering với context nhân viên, stream response, parse 3 lựa chọn. Explainable AI: top 3 lý do AI đưa ra khuyến nghị (hiển thị dạng tooltip). Luồng phê duyệt: chọn 1 → lưu DB.',
    assignee_code: 'ba1', day_label: 'T2 26/5', type: 'spec', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's5-02', sprint_id: 'sp-5', epic_code: 'E08',
    title: 'Hoàn thiện kịch bản demo + FAQ BOD',
    description: 'Demo script 25 phút đã rehearse. FAQ: 10 câu hỏi BOD hay hỏi nhất + trả lời chuẩn. Backup plan nếu mất kết nối. Print-out cho presenter.',
    assignee_code: 'ba1', day_label: 'T3-T4 27-28/5', type: 'doc', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's5-03', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'Test: Lộ trình Nghề nghiệp AI + Báo cáo Kirkpatrick',
    description: 'Test AI: generate 3 lựa chọn, verify Explainable AI hiển thị đúng, approve 1, archive phần còn lại. Test Kirkpatrick: verify tính toán 5 cấp, so sánh ROI đúng công thức.',
    assignee_code: 'ba2', day_label: 'T2-T3 26-27/5', type: 'test', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's5-04', sprint_id: 'sp-5', epic_code: 'E08',
    title: 'Kiểm thử hồi quy cuối + re-test UAT',
    description: 'Hồi quy toàn bộ app. Re-test tất cả items từ UAT 18/5 đã được fix. Ghi kết quả test vào báo cáo QA cuối cùng cho BOD nếu cần.',
    assignee_code: 'ba2', day_label: 'T4-T5 28-29/5', type: 'test', status: 'todo', priority: 'normal', estimated_hours: 5,
  },
  {
    id: 's5-05', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'UI Lộ trình AI: loading + 3 lựa chọn + panel Explainable AI',
    description: 'Loading state khi AI generate (spinner + text động). 3 option cards cạnh nhau: fit score, mô tả, skill gaps cần lấp. Panel Explainable AI: top 3 lý do dạng chip + thanh confidence. Nút Chọn + Lưu.',
    assignee_code: 'ds', day_label: 'T2 26/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
  {
    id: 's5-06', sprint_id: 'sp-5', epic_code: 'E08',
    title: 'Bộ slide trình bày BOD hoàn chỉnh',
    description: 'Deck BOD: vấn đề PTSC M&C gặp phải, giải pháp SuccessionOS, demo screenshots, ROI 262%, roadmap giai đoạn tiếp theo, next steps. Professional design với màu PTSC M&C.',
    assignee_code: 'ds', day_label: 'T3-T4 27-28/5', type: 'design', status: 'todo', priority: 'critical', estimated_hours: 6,
  },
  {
    id: 's5-07', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'Báo cáo Kirkpatrick 5 cấp + So sánh ROI + Dashboard tổng hợp',
    description: '5 level cards: L1 (hài lòng), L2 (kiến thức), L3 (hành vi), L4 (KPI), L5 (ROI 262%). Bảng so sánh: OJD 520% vs Mentoring 327% vs Formal 180%. Insight box khuyến nghị chiến lược.',
    assignee_code: 'ds', day_label: 'T5 29/5', type: 'design', status: 'todo', priority: 'priority', estimated_hours: 3,
  },
  {
    id: 's5-08', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'Tab AI trong hồ sơ + Rủi ro Domino + Mô phỏng Kế thừa',
    description: 'Tab AI trong /nhan-tai/[id]: lộ trình đã chọn + Explainable AI tooltip. Sơ đồ Rủi ro Domino: chain reaction khi vị trí trống. Mô phỏng kế thừa: what-if drag interface (read-only).',
    assignee_code: 'dj', day_label: 'T2-T3 26-27/5', type: 'design', status: 'todo', priority: 'priority', estimated_hours: 5,
  },
  {
    id: 's5-09', sprint_id: 'sp-5', epic_code: 'E08',
    title: 'Kiểm tra hiệu năng + bảo mật cuối + đóng băng staging',
    description: 'Performance audit: page load < 3s, API < 500ms. Security review: RLS policies, data leakage, no exposed secrets. Staging frozen sau T6 30/5 — không deploy thêm.',
    assignee_code: 'dj', day_label: 'T5-T6 29-30/5', type: 'design', status: 'todo', priority: 'normal', estimated_hours: 4,
  },
  {
    id: 's5-10', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'Tích hợp Claude API: Lộ trình AI + Rủi ro Domino + Mô phỏng',
    description: 'Claude API: prompt engineering, streaming, parse 3 lựa chọn, Explainable AI output. Career Path: generate → approve 1 → lưu DB. Domino Risk chain calculator. Succession Simulation what-if engine.',
    assignee_code: 'lead_dev', day_label: 'T2-T4 26-28/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 12,
  },
  {
    id: 's5-11', sprint_id: 'sp-5', epic_code: 'E06',
    title: 'Engine Báo cáo Kirkpatrick + Thị trường nhân sự manual',
    description: 'Kirkpatrick: tổng hợp từ assessments, completion IDP, chi phí đào tạo → tính L1-L5, so sánh ROI 3 phương thức. Market Intel: HR nhập benchmark thủ công, chênh lệch lương%, khảo sát engagement.',
    assignee_code: 'lead_dev', day_label: 'T3-T5 27-29/5', type: 'dev', status: 'todo', priority: 'priority', estimated_hours: 8,
  },
  {
    id: 's5-12', sprint_id: 'sp-5', epic_code: 'E08',
    title: 'Deploy staging cuối + diễn tập demo toàn team',
    description: 'Deploy phiên bản cuối lên staging. Diễn tập demo 25 phút với toàn team (2 lần). Ghi lại timing, câu hỏi khó. Fix issues cuối cùng. Staging frozen sau diễn tập.',
    assignee_code: 'tl', day_label: 'T5-T6 29-30/5', type: 'dev', status: 'todo', priority: 'critical', estimated_hours: 4,
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
  // backward compat
  high:     { text: '#F97316', label: 'High' },
  medium:   { text: '#F59E0B', label: 'Medium' },
  low:      { text: '#6B7280', label: 'Low' },
}

export const CRITICAL_ITEMS = [
  { n: 1,  item: 'Audit Trail (every DB write logged)',      sprint: 'S1' },
  { n: 2,  item: 'SSO + LDAP/AD',                           sprint: 'S1' },
  { n: 3,  item: 'Data Consent hard-stop',                  sprint: 'S1' },
  { n: 4,  item: 'Import line-by-line error',               sprint: 'S1' },
  { n: 5,  item: 'Assessment 3 sources + weight config',    sprint: 'S2' },
  { n: 6,  item: 'Competency Merging formula',              sprint: 'S2' },
  { n: 7,  item: 'Auto-layering 9-Box → tầng',             sprint: 'S2' },
  { n: 8,  item: 'Milestone-based assessment',              sprint: 'S2' },
  { n: 9,  item: 'Calibration Room + Data Freezing',        sprint: 'S2' },
  { n: 10, item: 'Succession Backfill AI',                  sprint: 'S2' },
  { n: 11, item: 'Position alert < 2 ứng viên',            sprint: 'S2' },
  { n: 12, item: 'IDP Draft + Stretch Assignment 70-20-10', sprint: 'S3' },
  { n: 13, item: 'Multi-stage Approval 8 cấp',             sprint: 'S3' },
  { n: 14, item: 'Gatekeeping IDP < 80%',                  sprint: 'S4' },
  { n: 15, item: 'IDP versioning + Request Change',         sprint: 'S4' },
  { n: 16, item: 'AI Career Path + Explainable AI',         sprint: 'S5' },
  { n: 17, item: 'Domino Risk chain',                       sprint: 'S5' },
]
