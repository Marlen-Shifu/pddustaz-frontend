import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1D5BBD',
    colorSuccess: '#30A943',
    colorWarning: '#FFE000',
    colorError: '#E73642',
    colorBgLayout: '#F8F8F8',
    colorBgContainer: '#FFFFFF',
    fontFamily: "'Open Sans', sans-serif",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 44,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 48,
    },
    Card: {
      borderRadiusLG: 20,
    },
    Menu: {
      itemBorderRadius: 12,
      itemHeight: 48,
      iconSize: 20,
    },
  },
};
