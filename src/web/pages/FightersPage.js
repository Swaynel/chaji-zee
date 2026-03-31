import React, { useState } from 'react';

import { FighterTile } from '../components/cards';
import { EmptyState, SearchInput } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

export default function FightersPage() {
  const [query, setQuery] = useState('');
  const {
    fighters,
    selectedFighter,
    selectFighter,
  } = useMarketplace();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFighters = fighters.filter((fighter) => {
    if (!normalizedQuery) {
      return true;
    }

    return [fighter.name, fighter.discipline, fighter.city, fighter.style]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <>
      <SearchInput
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search fighters, cities, disciplines…"
        value={query}
      />

      <div className="fgrid">
        {filteredFighters.length ? (
          filteredFighters.map((fighter) => (
            <FighterTile
              fighter={fighter}
              key={fighter.id}
              onSelect={() => selectFighter(fighter.id)}
              selected={selectedFighter?.id === fighter.id}
            />
          ))
        ) : (
          <div className="grid-empty">
            <EmptyState body="Try a different search." icon="🔍" title="No fighters found" />
          </div>
        )}
      </div>
    </>
  );
}
