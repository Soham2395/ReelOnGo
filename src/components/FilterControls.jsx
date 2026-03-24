import { useSettings } from '../SettingsContext.jsx';

export default function FilterControls({ filters, onFiltersChange, statuses, genders, availabilities }) {
  const { settings, getStatusConfig } = useSettings();

  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFiltersChange({ ...filters, status: 'ALL', gender: 'ALL', availability: 'ALL' });
  };

  const hasActiveFilters = filters.status !== 'ALL' || filters.gender !== 'ALL' || filters.availability !== 'ALL';

  return (
    <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${settings.COLORS.border}` }}>
      <FilterSelect 
        label="Status" 
        value={filters.status} 
        onChange={(v) => handleChange('status', v)} 
        options={statuses} 
        formatLabel={(v) => getStatusConfig(v).label} 
        settings={settings}
      />
      <FilterSelect 
        label="Gender" 
        value={filters.gender} 
        onChange={(v) => handleChange('gender', v)} 
        options={genders} 
        settings={settings}
      />
      <FilterSelect 
        label="Availability" 
        value={filters.availability} 
        onChange={(v) => handleChange('availability', v)} 
        options={availabilities} 
        settings={settings}
      />
      {hasActiveFilters && (
        <button onClick={handleClear} className="w-full text-center text-xs py-1 transition-colors" style={{ color: settings.COLORS.accent }}>
          Clear all filters
        </button>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, formatLabel, settings }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-16 shrink-0" style={{ color: settings.COLORS.textMuted }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs py-1.5 px-2.5 rounded-md focus:outline-none cursor-pointer appearance-none border"
        style={{
          background: settings.COLORS.surfaceLight,
          color: settings.COLORS.textPrimary,
          borderColor: settings.COLORS.border,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7080'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 6px center',
          backgroundSize: '12px',
        }}
      >
        <option value="ALL">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatLabel ? formatLabel(opt) : opt.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}
