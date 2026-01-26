import './Film.css'

function Film({ title }) {
  return (
    <div className="film">
      <h2 className="film-title">{title}</h2>
      {/* Contenu du film à venir */}
    </div>
  )
}

export default Film
