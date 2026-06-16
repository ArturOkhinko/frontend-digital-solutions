import { ConfigProvider, Typography } from 'antd';

const { Title, Paragraph } = Typography;

function App() {
  return (
    <ConfigProvider>
      <main style={{ padding: 24 }}>
        <Title level={2}>Frontend</Title>
        <Paragraph>React + TypeScript + antd is up and running.</Paragraph>
      </main>
    </ConfigProvider>
  );
}

export default App;
