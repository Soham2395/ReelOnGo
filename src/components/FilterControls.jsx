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
    <div className="mt-2 pt-3 grid grid-cols-3 gap-2" style={{ borderTop: `1px solid ${settings.COLORS.border}` }}>
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
        <div className="col-span-3 pt-1 flex justify-center">
          <button 
            onClick={handleClear} 
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors hover:bg-white/5" 
            style={{ color: settings.COLORS.accent }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, formatLabel, settings }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[9px] font-bold uppercase tracking-widest px-0.5 opacity-40 truncate" style={{ color: settings.COLORS.textPrimary }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[10px] py-1.5 pl-2 pr-6 rounded-md focus:outline-none cursor-pointer appearance-none border transition-all hover:bg-white/[0.03]"
        style={{
          background: settings.COLORS.surfaceLight,
          color: settings.COLORS.textPrimary,
          borderColor: settings.COLORS.border,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7080'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 4px center',
          backgroundSize: '10px',
        }}
      >
        <option value="ALL">All</option>
        {options?.map((opt) => (
          <option key={opt} value={opt} className="bg-[#161921] text-white">
            {formatLabel ? formatLabel(opt) : opt.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}
