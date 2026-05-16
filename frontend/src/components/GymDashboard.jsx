function GymDashboard({ user, gyms = [], error = '' }) {
  if (!user) {
    return <p>Not logged in</p>;
  }

  return (
    <section>
      <h2>Welcome, {user.name}</h2>

      <form aria-label="add-gym-form">
        <input type="text" placeholder="Gym name" />
        <button type="button">Add gym</button>
      </form>

      {error ? <p role="alert">{error}</p> : null}

      {gyms.length === 0 ? (
        <p>No gyms available</p>
      ) : (
        <ul>
          {gyms.map((gym) => (
            <li key={gym.id}>{gym.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default GymDashboard;
