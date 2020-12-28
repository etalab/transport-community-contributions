import {extractCountFromId, createIdFromCount, fillCovoiturageIds} from '@/utils/fillId.js'

const data = [
  ['id_lieu', 'address', 'insee'],
  ['75013-C-001', '...', '75013'],
  ['75016-C-002', '...', '75016'],
  ['', '...', '75013'],
  ['', '...', '75016'],
  ['', '...', '75000'],
]

test('extract the count part of the id (drop insee)', () => {
  expect(extractCountFromId('01024-C-001')).toEqual(1)
  expect(extractCountFromId('A1024-C-021')).toEqual(21)
  // insee code too long
  expect(extractCountFromId('666666-C-021')).toEqual(undefined)
})

test('create some ids', () => {
  expect(createIdFromCount('75013', 1)).toBe('75013-C-001')
  expect(createIdFromCount('75013', 52)).toBe('75013-C-052')
  expect(() => createIdFromCount('7501333', 1)).toThrow()
  expect(() => createIdFromCount('75013', 1000)).toThrow()
})

test('fill the ids of the given data', () => {
  let resultsData = fillCovoiturageIds(data)
  expect(resultsData).toEqual([
    ['id_lieu', 'address', 'insee'],
    ['75013-C-001', '...', '75013'],
    ['75016-C-002', '...', '75016'],
    ['75013-C-002', '...', '75013'],
    ['75016-C-003', '...', '75016'],
    ['75000-C-001', '...', '75000'],
  ])
})