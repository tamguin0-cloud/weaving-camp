const FRUITS = [
  '사과', '바나나', '포도', '딸기', '복숭아', '자두', '수박', '참외',
  '레몬', '오렌지', '블루베리', '체리', '망고', '키위', '감',
] as const

const VERBS = [
  '먹는', '씻는', '굴리는', '던지는', '숨기는',
  '지키는', '안은', '따라가는', '쳐다보는', '자르는',
] as const

const ANIMALS = [
  '오리', '너구리', '수달', '다람쥐', '토끼', '고슴도치', '미어캣', '판다',
  '고양이', '코끼리', '얼룩말', '기린', '호랑이', '돌고래', '침팬지',
] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateAnonName(): string {
  return `${pick(FRUITS)} ${pick(VERBS)} ${pick(ANIMALS)}`
}
