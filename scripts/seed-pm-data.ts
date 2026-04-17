/**
 * Seed script for PM Tool — tasks-export-v3.json (80 tasks)
 * Run: npx tsx scripts/seed-pm-data.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found.')
    process.exit(1)
  }
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const [k, ...v] = t.split('=')
    process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '')
  }
}

loadEnv()

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function upsert<T extends object>(table: string, rows: T[], conflict: string): Promise<T[]> {
  const { data, error } = await sb.from(table).upsert(rows, { onConflict: conflict }).select()
  if (error) { console.error(`❌ ${table}:`, error.message); process.exit(1) }
  return data as T[]
}

async function insertOrGet<T extends object>(table: string, row: T, matchCol: keyof T): Promise<T> {
  const { data: existing } = await sb.from(table).select('*').eq(matchCol as string, row[matchCol] as string).maybeSingle()
  if (existing) return existing as T
  const { data, error } = await sb.from(table).insert(row).select().single()
  if (error) { console.error(`❌ ${table}:`, error.message); process.exit(1) }
  return data as T
}

async function deleteAndInsert<T extends object>(table: string, rows: T[], projectId: string): Promise<T[]> {
  const { error: delErr } = await sb.from(table).delete().eq('project_id', projectId)
  if (delErr) { console.error(`❌ delete ${table}:`, delErr.message); process.exit(1) }
  if (rows.length === 0) return []
  const { data, error } = await sb.from(table).insert(rows).select()
  if (error) { console.error(`❌ insert ${table}:`, error.message); process.exit(1) }
  return data as T[]
}

async function main() {
  console.log('🌱 Seeding PM Tool (v3 — 80 tasks)...\n')

  // 1. TEAM MEMBERS ──────────────────────────────────────────────────────────
  console.log('👥 Team members...')
  const members = await upsert('pm_team_members', [
    { code: 'lk',  name: 'Lê Khiêm',       role: 'Project Manager',  color: '#1D9E75' },
    { code: 'tl',  name: 'Tech Lead',        role: 'Tech Lead',        color: '#BA7517' },
    { code: 'ba1', name: 'BA1',              role: 'Business Analyst', color: '#378ADD' },
    { code: 'ba2', name: 'BA2',              role: 'Business Analyst', color: '#639922' },
    { code: 'ds',  name: 'Designer Senior',  role: 'Designer',         color: '#7F77DD' },
    { code: 'dj',  name: 'Designer Junior',  role: 'Designer',         color: '#9B59B6' },
  ], 'code')
  const M: Record<string, string> = Object.fromEntries(members.map((m: any) => [m.code, m.id]))
  console.log(`   ✓ ${members.length} members`)

  // 2. PROJECT ───────────────────────────────────────────────────────────────
  console.log('📋 Project...')
  const project = await insertOrGet('pm_projects', {
    name: 'Dự án Kế nhiệm (Succession Planning)',
    description: 'Xây dựng SuccessionOS — Succession Planning SaaS cho doanh nghiệp.',
    start_date: '2026-04-20', end_date: '2026-05-31',
    status: 'active', progress_percent: 0,
  }, 'name')
  const pid = (project as any).id
  console.log(`   ✓ pid=${pid}`)

  // 3. MILESTONES ────────────────────────────────────────────────────────────
  console.log('🏁 Milestones...')
  const ms = await deleteAndInsert('pm_milestones', [
    { project_id: pid, title: 'Khởi động Dự án (Kick-off)',         description: 'Chốt đội ngũ DEV/QC và thống nhất quy trình làm việc.',               target_date: '2026-04-20', is_done: false },
    { project_id: pid, title: 'Foundation & Auth deployed',          description: 'Login 3 roles + SSO/LDAP + Employee CRUD + audit trail.',              target_date: '2026-04-24', is_done: false },
    { project_id: pid, title: 'Assessment Engine hoàn thành',        description: 'Assessment 3 sources, auto-layering, Calibration Room, Backfill AI.',  target_date: '2026-05-09', is_done: false },
    { project_id: pid, title: 'IDP + Approval + Mentoring xong',     description: 'IDP Draft + 8-cấp Approval + Gatekeeping + Mentoring pairs.',         target_date: '2026-05-16', is_done: false },
    { project_id: pid, title: 'AI + Reports tích hợp',               description: 'AI Career Path, Domino Risk, Succession Simulation, Kirkpatrick.',    target_date: '2026-05-23', is_done: false },
    { project_id: pid, title: 'Staging frozen — Zero critical bugs',  description: 'Full regression, demo run-through, stakeholder preview.',             target_date: '2026-05-30', is_done: false },
    { project_id: pid, title: 'BOD Demo Day',                         description: 'Demo toàn bộ hệ thống cho Ban Giám đốc.',                             target_date: '2026-05-31', is_done: false },
  ], pid)
  console.log(`   ✓ ${ms.length} milestones`)

  // 4. SPRINTS ───────────────────────────────────────────────────────────────
  console.log('🏃 Sprints...')
  const sprints = await deleteAndInsert('pm_sprints', [
    { project_id: pid, name: 'Sprint 1', theme: 'Nền tảng + Xác thực + Nhân viên',   start_date: '2026-04-20', end_date: '2026-04-24', status: 'active',   progress_percent: 0 },
    { project_id: pid, name: 'Sprint 2', theme: 'Đánh giá + 9-Box + APIs',            start_date: '2026-05-05', end_date: '2026-05-09', status: 'upcoming', progress_percent: 0 },
    { project_id: pid, name: 'Sprint 3', theme: 'Tích hợp UI + IDP + Hoàn thiện',    start_date: '2026-05-12', end_date: '2026-05-16', status: 'upcoming', progress_percent: 0 },
    { project_id: pid, name: 'Sprint 4', theme: 'Sửa UAT + Tính năng nâng cao',       start_date: '2026-05-19', end_date: '2026-05-23', status: 'upcoming', progress_percent: 0 },
    { project_id: pid, name: 'Sprint 5', theme: 'AI + Báo cáo + Chuẩn bị BOD',       start_date: '2026-05-26', end_date: '2026-05-30', status: 'upcoming', progress_percent: 0 },
  ], pid)
  const S: Record<string, string> = Object.fromEntries(sprints.map((s: any) => [s.name, s.id]))
  console.log(`   ✓ ${sprints.length} sprints`)

  // 5. EPICS ─────────────────────────────────────────────────────────────────
  console.log('🎯 Epics...')
  const epics = await deleteAndInsert('pm_epics', [
    { project_id: pid, sprint_id: S['Sprint 1'], code: 'E01', name: 'Nền tảng & Xác thực',   status: 'active',   color: '#4F46E5' },
    { project_id: pid, sprint_id: S['Sprint 1'], code: 'E02', name: 'Quản lý nhân viên',      status: 'active',   color: '#0EA5E9' },
    { project_id: pid, sprint_id: S['Sprint 2'], code: 'E03', name: 'Đánh giá & 9-Box',       status: 'upcoming', color: '#10B981' },
    { project_id: pid, sprint_id: S['Sprint 3'], code: 'E04', name: 'IDP & Phê duyệt',        status: 'upcoming', color: '#8B5CF6' },
    { project_id: pid, sprint_id: S['Sprint 2'], code: 'E05', name: 'Tích hợp UI',            status: 'upcoming', color: '#F59E0B' },
    { project_id: pid, sprint_id: S['Sprint 5'], code: 'E06', name: 'AI & Báo cáo',           status: 'upcoming', color: '#6B7280' },
    { project_id: pid, sprint_id: S['Sprint 4'], code: 'E07', name: 'Tính năng nâng cao',     status: 'upcoming', color: '#EC4899' },
    { project_id: pid, sprint_id: S['Sprint 3'], code: 'E08', name: 'Demo BOD',               status: 'upcoming', color: '#14B8A6' },
  ], pid)
  const E: Record<string, string> = Object.fromEntries(epics.map((e: any) => [e.code, e.id]))
  console.log(`   ✓ ${epics.length} epics`)

  // epic_code → sprint_id lookup
  const epicSprint: Record<string, string> = {
    E01: S['Sprint 1'], E02: S['Sprint 1'],
    E03: S['Sprint 2'], E05: S['Sprint 2'],
    E04: S['Sprint 3'], E08: S['Sprint 3'],
    E07: S['Sprint 4'],
    E06: S['Sprint 5'],
  }

  // 6. TASKS (80) ────────────────────────────────────────────────────────────
  console.log('✅ Tasks (80)...')

  type St = 'todo' | 'in-progress' | 'done' | 'blocked'
  type P  = 'critical' | 'priority' | 'normal'
  type Ty = 'spec' | 'story' | 'design' | 'dev' | 'test' | 'review' | 'doc'

  type RawTask = {
    ec: string; title: string; desc: string; ac: string; day: string
    type: Ty; status: St; priority: P; hrs: number
  }

  const raw: RawTask[] = [
    // ── SPRINT 1 (21) ──────────────────────────────────────────────────────
    { ec:'E01', title:'Thiết kế schema DB: nhân viên, tenant, vai trò, audit_logs',               desc:'Spec đầy đủ 8 bảng đầu tiên: tên field, kiểu dữ liệu, bắt buộc/tùy chọn, quan hệ khóa ngoại, indexes. Xác nhận quy ước đặt tên và chiến lược RLS với Tech Lead trước khi dev migrate.',                                                                                             ac:'ba1', day:'T2 20/4',      type:'spec',   status:'in-progress', priority:'critical', hrs:4  },
    { ec:'E01', title:'Spec bảng audit_logs: ai, khi nào, cái gì, lý do',                         desc:'Thiết kế bảng ghi lịch sử thay đổi: table_name, record_id, người thực hiện, thời điểm, hành động, giá trị cũ/mới (jsonb), lý do. Trigger gắn vào mọi bảng nhạy cảm. Bắt buộc theo Điều 7.',                                                                                           ac:'ba1', day:'T2 20/4',      type:'spec',   status:'in-progress', priority:'critical', hrs:2  },
    { ec:'E02', title:'Ma trận hiển thị trường: lương và dữ liệu nhạy cảm theo vai trò',          desc:'Bảng quyết định từng field: HR Admin, Ban PTNT, Quản lý, Nhân viên thấy gì. Lương thực (chỉ HR), chênh lệch lương % (Quản lý xem), yếu tố rủi ro thị trường (chỉ khi module bật).',                                                                                                  ac:'ba1', day:'T3 21/4',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E02', title:'Spec chặn cứng đồng ý xử lý dữ liệu cá nhân',                             desc:'Luồng theo Điều 21: checkbox bắt buộc tick trước khi gửi bất kỳ biểu mẫu nào. Nút Gửi bị vô hiệu hóa cho đến khi xác nhận. Lưu timestamp và user_id vào audit_log.',                                                                                                                  ac:'ba1', day:'T3 21/4',      type:'spec',   status:'todo',        priority:'critical', hrs:2  },
    { ec:'E02', title:'Spec nhập liệu: ánh xạ cột + báo lỗi từng dòng',                          desc:'Spec pipeline nhập: định dạng xlsx/csv, tự động nhận diện cột, quy tắc kiểm tra, báo lỗi từng dòng (số dòng + trường + thông báo), nhập một phần với xác nhận người dùng.',                                                                                                           ac:'ba1', day:'T4 22/4',      type:'spec',   status:'todo',        priority:'priority', hrs:3  },
    { ec:'E02', title:'Quy tắc nghiệp vụ CRUD nhân viên',                                         desc:'Trường bắt buộc khi tạo mới vs tùy chọn. Hiệu ứng xóa mềm (cascade). Quy tắc trigger audit log. Logic phát hiện trùng lặp.',                                                                                                                                                          ac:'ba1', day:'T5 23/4',      type:'spec',   status:'todo',        priority:'normal',   hrs:3  },
    { ec:'E01', title:'User story: luồng xác thực (đăng nhập, SSO, chuyển hướng)',                desc:'Story cho: đăng nhập email/mật khẩu, SSO, quên mật khẩu, chuyển hướng theo vai trò. AC: sai mật khẩu, tài khoản bị khóa, hết phiên làm việc.',                                                                                                                                        ac:'ba2', day:'T2 20/4',      type:'story',  status:'todo',        priority:'critical', hrs:3  },
    { ec:'E02', title:'User story: CRUD nhân viên + nhập file Excel/CSV',                          desc:'Story cho: thêm/sửa/xóa nhân viên, nhập Excel/CSV, hiển thị lỗi từng dòng. AC: email trùng, thiếu trường bắt buộc, sai định dạng ngày.',                                                                                                                                               ac:'ba2', day:'T3 21/4',      type:'story',  status:'todo',        priority:'normal',   hrs:3  },
    { ec:'E01', title:'Test case: xác thực + LDAP + phân quyền theo vai trò',                     desc:'Test: đăng nhập thành công/thất bại, SSO, LDAP của PTSC M&C, chuyển hướng theo vai trò, hết phiên, đăng xuất. Quyền: menu hiển thị theo vai trò. Trường hợp âm: bị từ chối truy cập.',                                                                                                ac:'ba2', day:'T4 22/4',      type:'test',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E02', title:'Test case: CRUD nhân viên + nhập file',                                     desc:'CRUD: tạo (thành công, trùng, thiếu bắt buộc), xem (lọc/sắp xếp), sửa (một phần, lương theo vai trò), xóa mềm cascade. Nhập: file hợp lệ, lỗi hỗn hợp, sai định dạng, file rỗng.',                                                                                                  ac:'ba2', day:'T5 23/4',      type:'test',   status:'todo',        priority:'normal',   hrs:3  },
    { ec:'E01', title:'Trang đăng nhập production + SSO + 3 biến thể vai trò',                    desc:'Trang đăng nhập chuyên nghiệp: logo PTSC M&C, trường email+mật khẩu, nút SSO, quên mật khẩu. 3 màn hình landing page sau đăng nhập theo từng vai trò.',                                                                                                                               ac:'ds',  day:'T2 20/4',      type:'design', status:'todo',        priority:'critical', hrs:4  },
    { ec:'E01', title:'Khung giao diện HR Admin: sidebar, header, breadcrumb',                    desc:'Sidebar navigation 4 nhóm, header hiển thị tên tenant + avatar + đăng xuất, breadcrumb, khu vực nội dung chính. Production-ready, hỗ trợ dark mode.',                                                                                                                                ac:'ds',  day:'T3 21/4',      type:'design', status:'todo',        priority:'normal',   hrs:4  },
    { ec:'E02', title:'Danh sách nhân viên + luồng nhập file + hiển thị lỗi từng dòng',           desc:'Danh sách: tìm kiếm, bộ lọc, sắp xếp, nút nhập. Luồng nhập: upload → ánh xạ cột → bảng lỗi validation → xác nhận. Hiển thị lỗi từng dòng là điểm then chốt.',                                                                                                                      ac:'ds',  day:'T4 22/4',      type:'design', status:'todo',        priority:'priority', hrs:5  },
    { ec:'E02', title:'Hồ sơ nhân viên: chế độ xem + chỉnh sửa production',                      desc:'Chế độ xem: 91 trường tổ chức theo tab. Chỉnh sửa: trường lương 2 biến thể theo vai trò. Nhập tag yếu tố rủi ro. Nâng cấp từ prototype lên production.',                                                                                                                             ac:'ds',  day:'T5-T6 23-24/4',type:'design', status:'todo',        priority:'normal',   hrs:6  },
    { ec:'E01', title:'Thư viện component: nút, badge, avatar + xuất design token',               desc:'Build Figma production: Button (4 biến thể × 4 trạng thái), Badge (6 loại), Avatar (kích cỡ). Input, Select, Date picker, Textarea — đầy đủ trạng thái. Xuất design tokens đồng bộ Tailwind config.',                                                                                 ac:'dj',  day:'T2-T5 20-23/4', type:'design', status:'todo',        priority:'normal',   hrs:12 },
    { ec:'E01', title:'Component phản hồi: toast, modal, dialog xác nhận, banner lỗi',            desc:'Toast (4 loại), Modal, Dialog xác nhận, Banner lỗi. Trạng thái rỗng, skeleton loading. Tất cả dark mode ready.',                                                                                                                                                                        ac:'dj',  day:'T6 24/4',       type:'design', status:'todo',        priority:'normal',   hrs:3  },
    { ec:'E01', title:'Thiết lập Supabase + Xác thực + SSO/LDAP + định tuyến vai trò',            desc:'Cấu hình Supabase, chính sách RLS, migrations. Auth: Supabase Auth + LDAP/AD cho PTSC M&C. Logic chuyển hướng theo vai trò. 3 tài khoản test (1 mỗi vai trò).',                                                                                                                     ac:'lead_dev', day:'T2-T3 20-21/4', type:'dev', status:'todo', priority:'critical', hrs:10 },
    { ec:'E02', title:'CRUD nhân viên + trigger audit + middleware phân quyền trường',            desc:'Migration bảng employees. API routes CRUD. Trigger audit: mọi INSERT/UPDATE/DELETE tự ghi audit_logs. Middleware hiển thị trường theo vai trò.',                                                                                                                                      ac:'lead_dev', day:'T3-T5 21-23/4', type:'dev', status:'todo', priority:'critical', hrs:10 },
    { ec:'E02', title:'Pipeline nhập file + kiểm tra từng dòng',                                  desc:'Parser Excel/CSV, tự động nhận diện cột, engine kiểm tra, tổng hợp lỗi từng dòng, API nhập một phần. Test với file mẫu có lỗi hỗn hợp.',                                                                                                                                             ac:'lead_dev', day:'T5-T6 23-24/4', type:'dev', status:'todo', priority:'priority', hrs:6  },
    { ec:'E01', title:'Tài liệu API Contracts',                                                    desc:'Document tất cả endpoints: phương thức, schema request/response, mã lỗi. DS và Lead Dev dùng tài liệu này để build UI và API song song trong Sprint 2.',                                                                                                                              ac:'tl',  day:'T6 24/4',       type:'dev',    status:'todo',        priority:'critical', hrs:3  },
    { ec:'E01', title:'Review code + demo Sprint 1 + retro',                                       desc:'TL review: chính sách RLS đúng chưa, trigger audit hoạt động chưa, không hardcode secret. Demo 3 vai trò, CRUD, nhập file, audit trail. Retro: ghi nhận blockers, velocity thực tế, điều chỉnh Sprint 2.',                                                                            ac:'tl',  day:'T6 24/4',       type:'review', status:'todo',        priority:'normal',   hrs:3  },

    // ── SPRINT 2 (21) ──────────────────────────────────────────────────────
    { ec:'E03', title:'Spec Đánh giá: 3 nguồn + cấu hình trọng số',                               desc:'3 nguồn (Quản lý trực tiếp 40%, Dự án 40%, 360° 20%). Cấu hình trọng số per tenant (tổng = 100%). 4 chiều per nguồn. Schema bảng assessment_sources.',                                                                                                                                ac:'ba1', day:'Nghỉ lễ',      type:'spec',   status:'todo',        priority:'critical', hrs:4  },
    { ec:'E03', title:'Spec công thức hợp nhất điểm năng lực',                                    desc:'Điểm hợp nhất = (Line×wL) + (Dự án×wP) + (360×w3) per chiều. Overall = tech×0.4 + perf×0.3 + beh×0.2 + pot×0.1. Xử lý edge case: chỉ có 1-2 nguồn.',                                                                                                                               ac:'ba1', day:'Nghỉ lễ',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Spec phân tầng tự động: ô 9-Box → tầng nhân sự',                          desc:'Sau khi Calibration khóa: Ô 9 → Kế thừa, Ô 6/8 → Tiềm năng cao, Ô 4/7 → Tiềm năng, Ô 5 → Nòng cốt. Edge: mới vào dưới 6 tháng không tự phân tầng. Thay đổi tầng cần phê duyệt.',                                                                                                  ac:'ba1', day:'Nghỉ lễ',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Spec đánh giá theo mốc dự án',                                             desc:'Trigger khi nhân viên kết thúc vai trò tại dự án trọng điểm (Điều 17). Tự tạo yêu cầu đánh giá gửi Quản lý dự án, deadline 14 ngày. Kết quả hợp nhất vào hồ sơ như thế nào.',                                                                                                       ac:'ba1', day:'Nghỉ lễ',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Spec Bản đồ kế thừa + Gợi ý AI điền vị trí trống',                        desc:'Thuật toán fit_score: overall_score - gap_penalty + idp_bonus - risk_penalty. Top 3 ứng viên per vị trí trống. Text lý do 1 câu. API endpoint + UI slide panel.',                                                                                                                     ac:'ba1', day:'T2 05/5',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Spec Phòng Hiệu chỉnh + Đóng băng dữ liệu',                               desc:'Tạo phiên, luồng thảo luận, đề xuất di chuyển, xác nhận/từ chối, khóa (bất biến sau khi khóa), audit trail mọi hành động. Trigger phân tầng tự động.',                                                                                                                               ac:'ba1', day:'T3 06/5',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Test: hiển thị trường theo vai trò (lương số thực vs %)',                  desc:'HR Admin: lương số thực. Quản lý: chênh lệch %. Nhân viên: ẩn hoàn toàn. Test ít nhất 3 nhân viên với 3 tài khoản khác nhau.',                                                                                                                                                       ac:'ba2', day:'T2 05/5',      type:'test',   status:'todo',        priority:'critical', hrs:2  },
    { ec:'E03', title:'Test: tính toán hợp nhất 3 nguồn đánh giá',                               desc:'Test với data mẫu đã biết kết quả. Thay đổi trọng số, verify tính lại đúng. Edge case: chỉ có 1 nguồn. Test lịch sử: nhiều chu kỳ không ghi đè nhau.',                                                                                                                              ac:'ba2', day:'T3 06/5',      type:'test',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Test: trigger phân tầng tự động từ 9-Box',                                 desc:'Setup phiên Calibration, khóa, verify nhân viên được gán đúng tầng. Verify ghi audit_log với lý do. Verify thông báo. Edge: ô cần review thủ công không tự phân tầng.',                                                                                                              ac:'ba2', day:'T4 07/5',      type:'test',   status:'todo',        priority:'critical', hrs:2  },
    { ec:'E02', title:'Kiểm thử hồi quy Sprint 1',                                                desc:'Chạy lại toàn bộ test Sprint 1 với bản production. Đặc biệt: audit trail, xóa mềm cascade, SSO không bị ảnh hưởng, hiển thị trường đúng sau thêm tính năng mới.',                                                                                                                   ac:'ba2', day:'T5 08/5',      type:'test',   status:'todo',        priority:'normal',   hrs:3  },
    { ec:'E03', title:'Thiết kế form Đánh giá (chuyển từ prototype sang production)',             desc:'Nâng cấp prototype /assessment: thêm trạng thái validation, loading khi lưu, dialog xác nhận khi đổi trọng số, link xem lịch sử. Không thiết kế lại từ đầu.',                                                                                                                       ac:'ds',  day:'T2 05/5',      type:'design', status:'todo',        priority:'critical', hrs:3  },
    { ec:'E03', title:'Thiết kế 9-Box production + Phòng Hiệu chỉnh',                            desc:'9-Box: chip tương tác, màu gradient theo quadrant, trục rõ ràng, tooltip. Phòng Hiệu chỉnh: chuyển thể từ prototype, thêm luồng thảo luận production, nút khóa với đếm ngược.',                                                                                                      ac:'ds',  day:'T3 06/5',      type:'design', status:'todo',        priority:'critical', hrs:5  },
    { ec:'E03', title:'Thiết kế thẻ vị trí kế thừa + panel Gợi ý AI',                            desc:'Thẻ vị trí: badge mức độ kế thừa (xanh/vàng/đỏ), banner cảnh báo, badge độ khó thay thế. Panel AI slide từ phải: top 3 ứng viên + fit score + lý do + nút thêm vào kế thừa.',                                                                                                       ac:'ds',  day:'T4 07/5',      type:'design', status:'todo',        priority:'critical', hrs:4  },
    { ec:'E03', title:'Thiết kế Dashboard Mật độ Kế thừa',                                       desc:"2 KPI card mới: 'Vị trí có ≥2 ứng viên sẵn sàng: X/12' và 'Vị trí cần bổ sung gấp: Y'. Progress bar per vị trí với marker ngưỡng tối thiểu.",                                                                                                                                        ac:'ds',  day:'T5 08/5',      type:'design', status:'todo',        priority:'priority', hrs:3  },
    { ec:'E03', title:'Hoàn thiện UI: yếu tố rủi ro + badge kế thừa + thẻ KPI cảnh báo',        desc:'Yếu tố rủi ro: tag có nút xóa, thêm custom, icon phân biệt nội bộ/thị trường. Badge kế thừa: 3 mức độ sẵn sàng. Thẻ KPI stat: số lớn + label + màu cảnh báo.',                                                                                                                      ac:'dj',  day:'T2-T3 05-06/5', type:'design', status:'todo',       priority:'normal',   hrs:6  },
    { ec:'E03', title:'Banner cảnh báo vị trí + thẻ KPI Mật độ Kế thừa',                         desc:'Component Banner cảnh báo (3 mức độ nghiêm trọng, có thể đóng, slot nút hành động). Component thẻ stat KPI. Progress bar với marker ngưỡng. Dùng lại nhiều trang.',                                                                                                                  ac:'dj',  day:'T4-T5 07-08/5', type:'design', status:'todo',       priority:'critical', hrs:4  },
    { ec:'E03', title:'Xây dựng Assessment Engine: 3 nguồn + công thức hợp nhất',                desc:'Migration bảng assessment_sources. Lưu trữ cấu hình trọng số per tenant. Tính toán hợp nhất phía server. API: tạo chu kỳ, thêm điểm nguồn, lấy lịch sử. Tính toán real-time.',                                                                                                      ac:'lead_dev', day:'T2-T4 05-07/5', type:'dev', status:'todo', priority:'critical', hrs:10 },
    { ec:'E03', title:'Tự động phân tầng + trigger đánh giá mốc dự án',                          desc:'Event listener khi calibration_sessions.status = "locked". Bulk update talent_tier_history. Cron job daily phát hiện project_assignments kết thúc → tạo assessment_request → gửi email. Deadline 14 ngày.',                                                                          ac:'lead_dev', day:'T3-T5 06-08/5', type:'dev', status:'todo', priority:'critical', hrs:8  },
    { ec:'E03', title:'API 9-Box + Bản đồ Kế thừa + Gợi ý AI điền chỗ trống',                   desc:'Tính 9-Box từ merged score (25 nhân viên). API Bản đồ Kế thừa với danh sách ứng viên. Thuật toán Backfill: fit_score → top 3. Chỉ số Phụ thuộc (< 2 sẵn sàng = đỏ). Cache 24h.',                                                                                                     ac:'lead_dev', day:'T4-T5 07-08/5', type:'dev', status:'todo', priority:'critical', hrs:8  },
    { ec:'E05', title:'Tích hợp UI: /nhan-tai và /vi-tri → real API',                             desc:'Thay thế mock data trong /talent và /positions bằng Supabase calls. Test với 25 nhân viên thật. Đây là 2 trang đầu tiên kết nối API thật. Verify field visibility hoạt động.',                                                                                                       ac:'lead_dev', day:'T5-T6 08-09/5', type:'dev', status:'todo', priority:'critical', hrs:5  },
    { ec:'E03', title:'Review code + demo Sprint 2 + lên kế hoạch Sprint 3',                      desc:'TL review: độ chính xác công thức Assessment (verify tay), tính đúng của phân tầng, logic thuật toán Backfill. Demo Sprint 2. Retro + xác nhận scope Sprint 3.',                                                                                                                     ac:'tl',  day:'T6 09/5',       type:'review', status:'todo',        priority:'normal',   hrs:3  },

    // ── SPRINT 3 (14) ──────────────────────────────────────────────────────
    { ec:'E04', title:'Spec IDP đơn giản: nháp + 3 loại hoạt động + phê duyệt 3 cấp',            desc:'IDP trạng thái nháp (lưu khi chưa đủ thông tin). 3 loại hoạt động: thực tế (70%), kèm cặp (20%), đào tạo chính quy (10%). Luồng phê duyệt: Quản lý → TCNS → Ban PTNT.',                                                                                                              ac:'ba1', day:'T2 12/5',      type:'spec',   status:'todo',        priority:'critical', hrs:4  },
    { ec:'E08', title:'Kịch bản UAT: 25 bước luồng cho khách hàng thực hiện',                    desc:'Script UAT 3 vai trò: HR Admin (quản lý nhân viên, đánh giá, kế thừa), Quản lý (nhập điểm, duyệt IDP), Nhân viên (tạo IDP, xem hồ sơ). Tiêu chí pass/fail rõ ràng.',                                                                                                                ac:'ba1', day:'T3 13/5',      type:'doc',    status:'todo',        priority:'critical', hrs:4  },
    { ec:'E08', title:'Spec dữ liệu seed: 25 nhân viên PTSC M&C đầy đủ',                         desc:'Danh sách 25 nhân viên với đầy đủ: điểm đánh giá, IDP, yếu tố rủi ro, chứng chỉ, cặp kèm cặp, bản đồ kế thừa. Dùng tên thật/hóa danh theo yêu cầu.',                                                                                                                               ac:'ba1', day:'T4 14/5',      type:'doc',    status:'todo',        priority:'critical', hrs:3  },
    { ec:'E04', title:'Test: lưu nháp IDP + gửi phê duyệt + đồng ý dữ liệu',                    desc:'Test: lưu nháp không cần đủ trường. Gửi phê duyệt bị chặn nếu chưa tick consent. Luồng phê duyệt 3 cấp: gửi → thông báo → duyệt/từ chối. Ghi audit log mỗi bước.',                                                                                                                  ac:'ba2', day:'T2 12/5',      type:'test',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E05', title:'Kiểm thử hồi quy toàn bộ app',                                             desc:'Chạy lại tất cả test Sprint 1+2 với bản staging đã tích hợp UI. Đặc biệt: xác thực, CRUD, assessment, bản đồ kế thừa. Ghi bug với severity + reproduction steps.',                                                                                                                  ac:'ba2', day:'T3-T4 13-14/5', type:'test',  status:'todo',        priority:'normal',   hrs:6  },
    { ec:'E08', title:'Test case UAT: luồng thành công + edge case cho khách hàng',               desc:'Hoàn thiện test case UAT: happy path mỗi vai trò (3 roles × 8-10 steps), edge cases quan trọng, tiêu chí pass/fail rõ ràng. Phối hợp với kịch bản UAT của BA1.',                                                                                                                     ac:'ba2', day:'T5 15/5',      type:'test',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E04', title:'Thiết kế IDP production: wizard + tab 70-20-10',                           desc:'Wizard IDP: trạng thái nháp + gửi duyệt. Tab 70-20-10: hoạt động với type badge, progress bar. Modal thêm nhiệm vụ thử thách. Stepper phê duyệt + checkbox đồng ý dữ liệu hard-stop.',                                                                                              ac:'ds',  day:'T2-T3 12-13/5', type:'design', status:'todo',       priority:'critical', hrs:6  },
    { ec:'E05', title:'Trạng thái rỗng + skeleton loading + trạng thái lỗi toàn app',             desc:'Empty states: khi chưa có data (hình minh họa + nút hành động). Loading skeleton: tất cả trang chính. Error states: lỗi API, timeout, unauthorized. Nhất quán toàn app.',                                                                                                           ac:'ds',  day:'T4-T5 14-15/5', type:'design', status:'todo',       priority:'critical', hrs:6  },
    { ec:'E05', title:'Tích hợp UI IDP: thẻ hoạt động + progress bar Stretch Assignment',         desc:'Thẻ hoạt động stretch: badge loại (6 màu), progress bar theo completion%, status dot animation. Tab 70-20-10 component. Dùng lại nhiều trang.',                                                                                                                                      ac:'dj',  day:'T2-T3 12-13/5', type:'design', status:'todo',       priority:'critical', hrs:5  },
    { ec:'E05', title:'Responsive + micro-interaction + chế độ in',                               desc:'Responsive: tablet (768-1024px), mobile (<768px). Micro-interactions: transitions, toasts, hover states. Chế độ xem in/xuất PDF cho hồ sơ nhân viên.',                                                                                                                               ac:'dj',  day:'T4-T5 14-15/5', type:'design', status:'todo',       priority:'normal',   hrs:5  },
    { ec:'E05', title:'Tích hợp UI: /danh-gia + /ket-thua + /hiệu-chinh → API thật',             desc:'Thay thế mock data trong /assessment, /succession, /calibration bằng Supabase calls. Verify với 25 nhân viên thật. Test field visibility sau tích hợp.',                                                                                                                             ac:'lead_dev', day:'T2-T3 12-13/5', type:'dev', status:'todo', priority:'critical', hrs:8  },
    { ec:'E04', title:'Tích hợp UI IDP + CRUD + phê duyệt 3 cấp',                                desc:'Thay thế mock data /idp. IDP CRUD: tạo nháp, thêm hoạt động 3 loại, tự tính progress. Luồng phê duyệt: gửi → thông báo email → duyệt/từ chối cấp 1 → 2 → 3.',                                                                                                                      ac:'lead_dev', day:'T3-T4 13-14/5', type:'dev', status:'todo', priority:'critical', hrs:8  },
    { ec:'E08', title:'Seed 25 nhân viên PTSC M&C vào staging + kiểm tra toàn bộ',               desc:'Chạy seed script với 25 nhân viên đầy đủ data: assessments, IDP, risk factors, certs, mentoring, succession map. Kiểm tra mọi trang hiển thị đúng. Đây là dữ liệu dùng cho UAT.',                                                                                                   ac:'lead_dev', day:'T4-T5 14-15/5', type:'dev', status:'todo', priority:'critical', hrs:6  },
    { ec:'E08', title:'Kiểm tra end-to-end + sửa bug critical + đóng băng staging',               desc:'TL chạy smoke test toàn bộ luồng. Fix critical bugs ngay. Deploy staging lần cuối. Không deploy thêm sau T6 16/5. Internal demo kiểm tra trước UAT.',                                                                                                                               ac:'tl',  day:'T5-T6 15-16/5', type:'dev',    status:'todo',        priority:'critical', hrs:5  },

    // ── SPRINT 4 (12) ──────────────────────────────────────────────────────
    { ec:'E07', title:'Phân loại feedback UAT: critical vs cần cải thiện',                        desc:'Sáng 18/5: collect feedback UAT. Chiều: phân loại với TL: critical bugs (phải sửa trước mọi thứ), UX feedback (sửa nếu < 2h), feature requests (backlog sau BOD). Assign cho team ngay.',                                                                                            ac:'ba1', day:'T2 19/5',      type:'spec',   status:'todo',        priority:'critical', hrs:3  },
    { ec:'E07', title:'Spec Phê duyệt đa cấp: 8 cấp cấu hình linh hoạt',                         desc:'Workflow Engine: Admin cấu hình số cấp (1-8) và người duyệt per loại yêu cầu. Chuỗi phê duyệt: gửi → thông báo cấp 1 → duyệt/từ chối → cấp 2 → ... → quyết định cuối. Deadline per cấp, tự leo thang khi quá hạn.',                                                               ac:'ba1', day:'T2-T3 19-20/5', type:'spec',  status:'todo',        priority:'critical', hrs:4  },
    { ec:'E07', title:'Spec Chặn cổng IDP + Phiên bản IDP',                                      desc:'Gatekeeping (Điều 137): nếu điểm < 80% → IDP tự chuyển "tạm dừng", thông báo quản lý. IDP Versioning: mỗi lần duyệt tạo version mới (v1, v2...). Yêu cầu thay đổi → luồng phê duyệt rút gọn → version mới.',                                                                        ac:'ba1', day:'T3-T4 20-21/5', type:'spec',  status:'todo',        priority:'critical', hrs:4  },
    { ec:'E08', title:'Kịch bản demo BOD: 25 phút từng bước click',                               desc:'Script demo 25 phút: /vi-tri (cảnh báo + backfill) → /nhan-tai/emp-006 (rủi ro + audit) → /danh-gia (3 nguồn) → /hieu-chinh (khóa) → /bao-cao (ROI). Câu trả lời cho 3 câu BOD hay hỏi nhất.',                                                                                     ac:'ba1', day:'T4-T5 21-22/5', type:'doc',   status:'todo',        priority:'critical', hrs:4  },
    { ec:'E07', title:'Document và test tất cả bug từ UAT',                                        desc:'Document chi tiết mọi bug UAT: mô tả, reproduction steps, screenshot, severity (P1/P2/P3). Test lại sau khi dev fix. Confirm với khách hàng nếu cần.',                                                                                                                               ac:'ba2', day:'T2-T3 19-20/5', type:'test',  status:'todo',        priority:'critical', hrs:5  },
    { ec:'E07', title:'Test: Phê duyệt đa cấp 8 cấp + Chặn cổng IDP',                           desc:'Test phê duyệt: cấu hình 3 cấp/5 cấp/8 cấp, verify chuỗi thông báo đúng, auto-escalate khi quá deadline. Test gatekeeping: assessment < 80% → IDP tạm dừng tự động.',                                                                                                               ac:'ba2', day:'T4-T5 21-22/5', type:'test',  status:'todo',        priority:'critical', hrs:4  },
    { ec:'E07', title:'UI Phê duyệt đa cấp (stepper 8 cấp) + Phòng Kèm cặp',                    desc:'Stepper phê duyệt 8 cấp: visual trạng thái từng cấp, người duyệt, deadline, comment. Trang Kèm cặp production: danh sách cặp + log-book timeline + form thêm buổi.',                                                                                                                 ac:'ds',  day:'T2-T3 19-20/5', type:'design', status:'todo',       priority:'critical', hrs:6  },
    { ec:'E07', title:'UI Phiên bản IDP + Phòng Hiệu chỉnh production',                          desc:'Panel lịch sử phiên bản IDP (timeline version cũ). Phòng Hiệu chỉnh production: drag-drop chip, luồng comment + xác nhận, nút khóa. Khác biệt rõ với /bản-đồ-kế-thừa.',                                                                                                            ac:'ds',  day:'T3-T5 20-22/5', type:'design', status:'todo',       priority:'critical', hrs:6  },
    { ec:'E07', title:'UI Chặn cổng IDP + KTP danh mục tri thức',                                desc:'Trạng thái IDP "tạm dừng": visual cảnh báo, thông báo quản lý, yêu cầu tư vấn trước khi tiếp tục. Danh sách tri thức KTP: 4 loại, mức độ quan trọng, tiến độ chuyển giao.',                                                                                                         ac:'dj',  day:'T2-T4 19-21/5', type:'design', status:'todo',       priority:'critical', hrs:5  },
    { ec:'E07', title:'Sửa toàn bộ bug critical từ UAT',                                           desc:'Fix tất cả bugs priority P1 từ UAT 18/5. Không thêm tính năng mới cho đến khi hết P1. Deploy từng fix lên staging và verify ngay.',                                                                                                                                                  ac:'lead_dev', day:'T2-T3 19-20/5', type:'dev', status:'todo', priority:'critical', hrs:10 },
    { ec:'E07', title:'Workflow Engine phê duyệt đa cấp 8 cấp + Chặn cổng IDP',                  desc:'Workflow Engine: cấu hình số cấp + người duyệt per loại. Chuỗi thông báo. Auto-escalate khi quá hạn. Gatekeeping trigger: monitor assessment score → pause IDP → notify → yêu cầu tư vấn.',                                                                                          ac:'lead_dev', day:'T2-T5 19-22/5', type:'dev', status:'todo', priority:'critical', hrs:12 },
    { ec:'E07', title:'Phiên bản IDP + CRUD Kèm cặp + Backend Phòng Hiệu chỉnh',                 desc:'IDP versioning: version mới mỗi lần approve, archive version cũ. Mentoring: CRUD cặp + log phiên + theo dõi giờ. Calibration backend: quản lý phiên, luồng thảo luận, cơ chế khóa, audit trail.',                                                                                  ac:'lead_dev', day:'T3-T6 20-23/5', type:'dev', status:'todo', priority:'critical', hrs:10 },

    // ── SPRINT 5 (12) ──────────────────────────────────────────────────────
    { ec:'E06', title:'Spec Lộ trình Nghề nghiệp AI + Explainable AI',                            desc:'Tích hợp Claude API: prompt engineering với context nhân viên, stream response, parse 3 lựa chọn. Explainable AI: top 3 lý do AI đưa ra khuyến nghị (hiển thị dạng tooltip). Luồng phê duyệt: chọn 1 → lưu DB.',                                                                    ac:'ba1', day:'T2 26/5',      type:'spec',   status:'todo',        priority:'critical', hrs:4  },
    { ec:'E08', title:'Hoàn thiện kịch bản demo + FAQ BOD',                                        desc:'Demo script 25 phút đã rehearse. FAQ: 10 câu hỏi BOD hay hỏi nhất + trả lời chuẩn. Backup plan nếu mất kết nối. Print-out cho presenter.',                                                                                                                                           ac:'ba1', day:'T3-T4 27-28/5', type:'doc',   status:'todo',        priority:'critical', hrs:4  },
    { ec:'E06', title:'Test: Lộ trình Nghề nghiệp AI + Báo cáo Kirkpatrick',                     desc:'Test AI: generate 3 lựa chọn, verify Explainable AI hiển thị đúng, approve 1, archive phần còn lại. Test Kirkpatrick: verify tính toán 5 cấp, so sánh ROI đúng công thức.',                                                                                                          ac:'ba2', day:'T2-T3 26-27/5', type:'test',  status:'todo',        priority:'critical', hrs:4  },
    { ec:'E08', title:'Kiểm thử hồi quy cuối + re-test UAT',                                      desc:'Hồi quy toàn bộ app. Re-test tất cả items từ UAT 18/5 đã được fix. Ghi kết quả test vào báo cáo QA cuối cùng cho BOD nếu cần.',                                                                                                                                                      ac:'ba2', day:'T4-T5 28-29/5', type:'test',  status:'todo',        priority:'normal',   hrs:5  },
    { ec:'E06', title:'UI Lộ trình AI: loading + 3 lựa chọn + panel Explainable AI',              desc:'Loading state khi AI generate (spinner + text động). 3 option cards cạnh nhau: fit score, mô tả, skill gaps cần lấp. Panel Explainable AI: top 3 lý do dạng chip + thanh confidence. Nút Chọn + Lưu.',                                                                               ac:'ds',  day:'T2 26/5',       type:'design', status:'todo',        priority:'critical', hrs:4  },
    { ec:'E08', title:'Bộ slide trình bày BOD hoàn chỉnh',                                         desc:'Deck BOD: vấn đề PTSC M&C gặp phải, giải pháp SuccessionOS, demo screenshots, ROI 262%, roadmap giai đoạn tiếp theo, next steps. Professional design với màu PTSC M&C.',                                                                                                             ac:'ds',  day:'T3-T4 27-28/5', type:'design', status:'todo',        priority:'critical', hrs:6  },
    { ec:'E06', title:'Báo cáo Kirkpatrick 5 cấp + So sánh ROI + Dashboard tổng hợp',            desc:'5 level cards: L1 (hài lòng), L2 (kiến thức), L3 (hành vi), L4 (KPI), L5 (ROI 262%). Bảng so sánh: OJD 520% vs Mentoring 327% vs Formal 180%. Insight box khuyến nghị chiến lược.',                                                                                                  ac:'ds',  day:'T5 29/5',        type:'design', status:'todo',        priority:'priority', hrs:3  },
    { ec:'E06', title:'Tab AI trong hồ sơ + Rủi ro Domino + Mô phỏng Kế thừa',                   desc:'Tab AI trong /nhan-tai/[id]: lộ trình đã chọn + Explainable AI tooltip. Sơ đồ Rủi ro Domino: chain reaction khi vị trí trống. Mô phỏng kế thừa: what-if drag interface (read-only).',                                                                                                ac:'dj',  day:'T2-T3 26-27/5', type:'design', status:'todo',        priority:'priority', hrs:5  },
    { ec:'E08', title:'Kiểm tra hiệu năng + bảo mật cuối + đóng băng staging',                   desc:'Performance audit: page load < 3s, API < 500ms. Security review: RLS policies, data leakage, no exposed secrets. Staging frozen sau T6 30/5 — không deploy thêm.',                                                                                                                   ac:'dj',  day:'T5-T6 29-30/5', type:'design', status:'todo',        priority:'normal',   hrs:4  },
    { ec:'E06', title:'Tích hợp Claude API: Lộ trình AI + Rủi ro Domino + Mô phỏng',             desc:'Claude API: prompt engineering, streaming, parse 3 lựa chọn, Explainable AI output. Career Path: generate → approve 1 → lưu DB. Domino Risk chain calculator. Succession Simulation what-if engine.',                                                                                ac:'lead_dev', day:'T2-T4 26-28/5', type:'dev', status:'todo', priority:'critical', hrs:12 },
    { ec:'E06', title:'Engine Báo cáo Kirkpatrick + Thị trường nhân sự manual',                   desc:'Kirkpatrick: tổng hợp từ assessments, completion IDP, chi phí đào tạo → tính L1-L5, so sánh ROI 3 phương thức. Market Intel: HR nhập benchmark thủ công, chênh lệch lương%, khảo sát engagement.',                                                                                  ac:'lead_dev', day:'T3-T5 27-29/5', type:'dev', status:'todo', priority:'priority', hrs:8  },
    { ec:'E08', title:'Deploy staging cuối + diễn tập demo toàn team',                            desc:'Deploy phiên bản cuối lên staging. Diễn tập demo 25 phút với toàn team (2 lần). Ghi lại timing, câu hỏi khó. Fix issues cuối cùng. Staging frozen sau diễn tập.',                                                                                                                   ac:'tl',  day:'T5-T6 29-30/5', type:'dev',    status:'todo',        priority:'critical', hrs:4  },
  ]

  const tasks = raw.map(r => ({
    project_id:      pid,
    sprint_id:       epicSprint[r.ec],
    epic_id:         E[r.ec],
    title:           r.title,
    description:     r.desc,
    assignee_id:     M[r.ac] ?? null,
    day_label:       r.day,
    type:            r.type,
    status:          r.status,
    priority:        r.priority,
    estimated_hours: r.hrs,
  }))

  const inserted = await deleteAndInsert('pm_tasks', tasks, pid)
  console.log(`   ✓ ${inserted.length} tasks`)

  console.log('\n✅ Seed complete!')
  console.log(`   80 tasks across 5 sprints, 8 epics, 6 members`)
}

main().catch(err => { console.error('💥', err); process.exit(1) })
