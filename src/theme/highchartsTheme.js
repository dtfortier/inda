const highchartsTheme = {
  colors: [
    '#0B7488', // teal primary
    '#E84B8A', // magenta secondary
    '#1D354F', // dark navy
    '#F4A261', // amber
    '#2A9D8F', // green teal
    '#E76F51', // coral
    '#027887', // deep teal
    '#5B8C5A', // sage green
  ],
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
    },
    spacingTop: 8,
    spacingBottom: 8,
  },
  title: {
    text: undefined,
  },
  subtitle: {
    text: undefined,
  },
  xAxis: {
    lineWidth: 0,
    tickLength: 0,
    labels: { enabled: false },
    title: { text: null },
  },
  yAxis: {
    gridLineWidth: 0,
    lineWidth: 0,
    labels: { enabled: false },
    title: { text: null },
  },
  legend: {
    squareSymbol: false,
    symbolRadius: 6,
    symbolHeight: 12,
    symbolWidth: 12,
    itemStyle: {
      color: '#576773',
      fontWeight: '400',
      fontSize: '12px',
    },
    itemHoverStyle: {
      color: '#273540',
    },
  },
  tooltip: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    shadow: {
      color: 'rgba(35, 68, 101, 0.15)',
      offsetX: 0,
      offsetY: 2,
      width: 4,
    },
    style: {
      color: '#273540',
      fontSize: '13px',
    },
  },
  plotOptions: {
    series: {
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRadius: 4,
    },
    column: {
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRadius: 4,
    },
    bar: {
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRadius: 4,
    },
    pie: {
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  },
  credits: {
    enabled: false,
  },
}

export default highchartsTheme
