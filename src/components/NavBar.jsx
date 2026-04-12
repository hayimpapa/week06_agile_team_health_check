const TABS = [
  { id: 'app', label: 'Squad Health Check', shortLabel: 'Health Check' },
  { id: 'about', label: 'About This Build', shortLabel: 'About' },
];

export default function NavBar({ activeTab, onTabChange }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4 h-14">
          <a
            href="https://52-app.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="52 Apps in 52 Weeks"
            className="flex-shrink-0 p-1 opacity-90 hover:opacity-100 transition-opacity"
          >
            <img
              src="https://raw.githubusercontent.com/hayimpapa/week00-main-page/main/public/w52.png"
              alt="52 Apps Logo"
              className="h-[34px] w-auto rounded-md block"
            />
          </a>
          <nav
            className="flex items-stretch gap-1 overflow-x-auto flex-1 -mx-1 px-1"
            aria-label="Main sections"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-pressed={isActive}
                  className={`whitespace-nowrap px-3 sm:px-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
