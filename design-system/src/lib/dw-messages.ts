// 생성 파일 — design/messages.json을 고치고 pnpm build:messages
export type DwMessageKey =
  | "common.close"
  | "common.loading"
  | "common.retry"
  | "breadcrumb.label"
  | "breadcrumb.more"
  | "calendar.previousMonth"
  | "calendar.nextMonth"
  | "calendar.year"
  | "calendar.month"
  | "calendar.today"
  | "calendar.selected"
  | "calendar.week"
  | "calendar.weekHeader"
  | "calendar.nav"
  | "combobox.open"
  | "combobox.placeholder"
  | "combobox.idle"
  | "combobox.loading"
  | "combobox.empty"
  | "combobox.error"
  | "combobox.list"
  | "combobox.results"
  | "combobox.remove"
  | "connectionBanner.offline"
  | "connectionBanner.reconnecting"
  | "connectionBanner.unstable"
  | "connectionBanner.online"
  | "connectionBanner.dismiss"
  | "datePicker.label"
  | "datePicker.clear"
  | "filter.label"
  | "filter.applied"
  | "filter.description"
  | "filter.reset"
  | "filter.apply"
  | "filter.tags"
  | "filter.remove"
  | "formSection.required"
  | "infoTooltip.label"
  | "listFooter.totalItems"
  | "listFooter.totalPeople"
  | "pageHeader.back"
  | "pagination.label"
  | "pagination.previous"
  | "pagination.next"
  | "pagination.previousShort"
  | "pagination.nextShort"
  | "pagination.more"
  | "pagination.page"
  | "passwordInput.show"
  | "searchInput.clear"
  | "searchableSelect.all"
  | "searchableSelect.clear"
  | "sidebar.title"
  | "sidebar.description"
  | "sidebar.collapse"
  | "sidebar.expand"
  | "slider.minimum"
  | "slider.maximum"
  | "slider.value"
  | "statCard.increase"
  | "statCard.decrease"
  | "statCard.noChange"
  | "stepper.completed"
  | "toast.region"

export const ko: Record<DwMessageKey, string> = {
  "common.close": "닫기",
  "common.loading": "불러오는 중",
  "common.retry": "다시 시도",
  "breadcrumb.label": "현재 위치",
  "breadcrumb.more": "접힌 단계",
  "calendar.previousMonth": "이전 달",
  "calendar.nextMonth": "다음 달",
  "calendar.year": "연도",
  "calendar.month": "월",
  "calendar.today": "오늘, {date}",
  "calendar.selected": "{date}, 선택됨",
  "calendar.week": "{week}주차",
  "calendar.weekHeader": "주 번호",
  "calendar.nav": "달 이동",
  "combobox.open": "목록 열기",
  "combobox.placeholder": "{min}자 이상 입력",
  "combobox.idle": "{min}자 이상 입력해주세요",
  "combobox.loading": "검색 중…",
  "combobox.empty": "검색 결과가 없어요",
  "combobox.error": "검색하지 못했어요. 다시 시도해주세요.",
  "combobox.list": "검색 결과",
  "combobox.results": "검색 결과 {count}개",
  "combobox.remove": "{label} 빼기",
  "connectionBanner.offline": "서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.",
  "connectionBanner.reconnecting": "다시 연결하는 중이에요",
  "connectionBanner.unstable": "연결이 불안정해요. 일부 내용이 늦게 보일 수 있어요.",
  "connectionBanner.online": "다시 연결됐어요",
  "connectionBanner.dismiss": "연결 안내 닫기",
  "datePicker.label": "날짜 선택",
  "datePicker.clear": "날짜 지우기",
  "filter.label": "조회 조건",
  "filter.applied": "조회 조건 — {count}개 적용됨",
  "filter.description": "{title}을 고른 뒤 조회해요.",
  "filter.reset": "초기화",
  "filter.apply": "조회",
  "filter.tags": "적용된 조회 조건",
  "filter.remove": "{label} 조건 지우기",
  "formSection.required": "필수",
  "infoTooltip.label": "{label} 안내",
  "listFooter.totalItems": "총 {count}개",
  "listFooter.totalPeople": "총 {count}명",
  "pageHeader.back": "뒤로",
  "pagination.label": "페이지",
  "pagination.previous": "이전 페이지",
  "pagination.next": "다음 페이지",
  "pagination.previousShort": "이전",
  "pagination.nextShort": "다음",
  "pagination.more": "생략된 페이지",
  "pagination.page": "{page} 페이지",
  "passwordInput.show": "비밀번호 표시",
  "searchInput.clear": "입력 지우기",
  "searchableSelect.all": "전체",
  "searchableSelect.clear": "{label} 지우기",
  "sidebar.title": "주 메뉴",
  "sidebar.description": "화면을 이동하는 메뉴예요.",
  "sidebar.collapse": "메뉴 접기",
  "sidebar.expand": "메뉴 펼치기",
  "slider.minimum": "최솟값",
  "slider.maximum": "최댓값",
  "slider.value": "{total}개 중 {index}번째 값",
  "statCard.increase": "증가",
  "statCard.decrease": "감소",
  "statCard.noChange": "변동 없음",
  "stepper.completed": "완료",
  "toast.region": "알림",
}

export const en: Record<DwMessageKey, string> = {
  "common.close": "Close",
  "common.loading": "Loading",
  "common.retry": "Try again",
  "breadcrumb.label": "Breadcrumb",
  "breadcrumb.more": "More levels",
  "calendar.previousMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.year": "Year",
  "calendar.month": "Month",
  "calendar.today": "Today, {date}",
  "calendar.selected": "{date}, selected",
  "calendar.week": "Week {week}",
  "calendar.weekHeader": "Week number",
  "calendar.nav": "Month navigation",
  "combobox.open": "Open list",
  "combobox.placeholder": "Type {min}+ characters",
  "combobox.idle": "Type {min}+ characters to search",
  "combobox.loading": "Searching…",
  "combobox.empty": "No results",
  "combobox.error": "Couldn't search. Try again.",
  "combobox.list": "Search results",
  "combobox.results": "Results: {count}",
  "combobox.remove": "Remove {label}",
  "connectionBanner.offline": "Can't connect to the server. Try again in a moment.",
  "connectionBanner.reconnecting": "Reconnecting",
  "connectionBanner.unstable": "Your connection is unstable. Some content may load slowly.",
  "connectionBanner.online": "Reconnected",
  "connectionBanner.dismiss": "Close connection notice",
  "datePicker.label": "Select date",
  "datePicker.clear": "Clear date",
  "filter.label": "Filters",
  "filter.applied": "Filters — {count} applied",
  "filter.description": "Choose {title}, then apply",
  "filter.reset": "Reset",
  "filter.apply": "Apply",
  "filter.tags": "Applied filters",
  "filter.remove": "Remove filter {label}",
  "formSection.required": "Required",
  "infoTooltip.label": "About {label}",
  "listFooter.totalItems": "Total: {count}",
  "listFooter.totalPeople": "Total: {count}",
  "pageHeader.back": "Back",
  "pagination.label": "Pagination",
  "pagination.previous": "Previous page",
  "pagination.next": "Next page",
  "pagination.previousShort": "Previous",
  "pagination.nextShort": "Next",
  "pagination.more": "More pages",
  "pagination.page": "Page {page}",
  "passwordInput.show": "Show password",
  "searchInput.clear": "Clear input",
  "searchableSelect.all": "All",
  "searchableSelect.clear": "Clear {label}",
  "sidebar.title": "Main menu",
  "sidebar.description": "Menu for moving between screens",
  "sidebar.collapse": "Collapse menu",
  "sidebar.expand": "Expand menu",
  "slider.minimum": "Minimum",
  "slider.maximum": "Maximum",
  "slider.value": "Value {index} of {total}",
  "statCard.increase": "Increase",
  "statCard.decrease": "Decrease",
  "statCard.noChange": "No change",
  "stepper.completed": "Completed",
  "toast.region": "Notifications",
}
