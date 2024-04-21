import { Button, Layout } from 'tdesign-react'

function App(): JSX.Element {
  const login = async (): Promise<void> => {
    const result: number = await window.api.test()
    alert(result)
  }

  return (
    <Layout>
      <Button onClick={login}>Test!</Button>
    </Layout>
  )
}

export default App
