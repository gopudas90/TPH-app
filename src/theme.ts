import { theme } from 'antd';

export const getThemeConfig = (isDarkMode: boolean) => ({
  algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: '#ff6b6b', // Pastel red
    colorInfo: '#ff6b6b',
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,
    fontSizeHeading4: 14,
    fontSizeHeading5: 13,
    fontSizeSM: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 6,
  },
  components: {
    Typography: {
      fontSize: 13,
    },
    Button: {
      fontSize: 13,
    },
    Table: {
      fontSize: 13,
    },
    Input: {
      fontSize: 13,
    },
    Select: {
      fontSize: 13,
    },
    Menu: {
      fontSize: 13,
      ...(isDarkMode ? {
        darkItemBg: '#141414',
        darkSubMenuItemBg: '#141414',
        darkItemSelectedBg: '#2a2a2a',
        darkItemHoverBg: '#1f1f1f',
      } : {}),
    },
    Layout: {
      ...(isDarkMode ? {
        siderBg: '#141414',
        headerBg: '#1a1a1a',
        triggerBg: '#1f1f1f',
      } : {}),
    },
    Card: {
      fontSize: 13,
    },
    Tabs: {
      fontSize: 13,
    }
  }
});
