interface Tab {
  path: string;
  name: string;
}

interface Props {
  tabs: Tab[];
  active: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

export default function TabBar({ tabs, active, onSelect, onClose }: Props) {
  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <div
          key={t.path}
          className={`tab ${active === t.path ? "active" : ""}`}
          onClick={() => onSelect(t.path)}
        >
          {t.name}
          <span
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(t.path);
            }}
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
}
