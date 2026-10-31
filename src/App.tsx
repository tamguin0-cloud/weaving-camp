import { useEffect, useState } from 'react'
import Board from './pages/Board'
import Admin from './pages/Admin'

type Route = 'board' | 'admin'

function getRouteFromHash(): Route {
  return window.location.hash === '#/admin' ? 'admin' : 'board'
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash)

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route === 'admin' ? <Admin /> : <Board />
}
