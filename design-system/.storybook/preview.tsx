import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/globals.css'
import { DwLocaleProvider, type DwLocale } from '../src/lib/dw-locale'

// 툴바의 테마 선택을 design/tokens.css의 [data-theme]로 넘긴다
const withTheme: Decorator = (Story, context) => {
  document.documentElement.dataset.theme = context.globals.theme
  return <Story />
}

// 툴바가 English일 때만 Provider로 감싼다. 한국어(기본)는 Provider 없는 실제 기본 경로로 그린다.
// 스토리가 자기 Provider를 두면 데코레이터보다 안쪽이라 그쪽이 이긴다
const withLocale: Decorator = (Story, context) =>
  context.globals.locale === 'en' ? (
    <DwLocaleProvider locale={context.globals.locale as DwLocale}>
      <Story />
    </DwLocaleProvider>
  ) : (
    <Story />
  )

const preview: Preview = {
  globalTypes: {
    theme: {
      description: '테마',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: '라이트' },
          { value: 'dark', title: '다크' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: '언어',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', locale: 'ko' },
  decorators: [withTheme, withLocale],
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Overview',
          'Theme',
          'Updates',
          'Element',
          ['소개', 'Basic', 'Spacing', 'Decorate'],
          'Foundations',
          ['CI', 'Colors', 'Typography', 'Spacing', 'Shape', 'Depth', 'Z-index', 'Motion', 'Interaction', 'Control Height', 'Breakpoints', 'Grid'],
          'Component',
          ['Actions', 'Inputs', 'Feedback', 'Display', 'Navigation', 'State'],
          'Patterns',
        ],
      },
    },
    controls: { expanded: true },
    a11y: { test: 'error' },
    viewport: {
      options: {
        mobile: { name: '모바일 375', styles: { width: '375px', height: '812px' } },
        tablet: { name: '태블릿 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: '데스크톱 1280', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
}

export default preview
