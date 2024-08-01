export const useWH = () => {
  interface IWarehouse {
    id: number
    label: string
  }
  const stored = localStorage.getItem('wh')

  const wh = useState<IWarehouse>('defWh', () =>
    stored ? JSON.parse(stored) : { id: 0, label: '' }
  )

  function set(data: IWarehouse | null) {
    if (data) {
      localStorage.setItem('wh', JSON.stringify(data))
      wh.value = data
    } else {
      localStorage.removeItem('wh')
      wh.value = { id: 0, label: '' }
    }
  }

  return { wh: wh.value, set }
}
