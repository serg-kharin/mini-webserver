import type { Lang } from '@/i18n/i18n'

export default function LanguageGate({ onChoose }: { onChoose: (lang: Lang) => void }) {
  return (
    <article style={{ maxWidth: '360px', margin: '15vh auto' }}>
      <h2>Выберите язык / Choose language</h2>
      <div className="grid">
        <button onClick={() => onChoose('ru')}>Русский</button>
        <button onClick={() => onChoose('en')}>English</button>
      </div>
    </article>
  )
}
