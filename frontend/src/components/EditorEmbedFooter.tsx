import { ChevronRightIcon } from "@heroicons/react/outline";
import { useState } from "react";

export default function EditorEmbedFooter() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div>
      <div
        className="text-medium flex-auto cursor-pointer flex items-center space-x-2 text-gray-300 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRightIcon
          className={`h-5 w-5 transition-transform duration-300 ${
            collapsed ? "" : "rotate-90"
          }`}
        />
        <div>Footer</div>
      </div>
      {!collapsed ? (
        <div className="space-y-4 mt-3">
          <div>
            <div className="uppercase text-gray-300 text-sm font-medium mb-1.5">
              Footer
            </div>
            <input
              type="text"
              className="bg-dark-2 rounded p-2 w-full no-ring font-light"
            />
          </div>
          <div className="flex space-x-3">
            <div className="flex-auto">
              <div className="uppercase text-gray-300 text-sm font-medium mb-1.5">
                Timestamp
              </div>
              <input
                type="text"
                className="bg-dark-2 rounded p-2 w-full no-ring font-light"
              />
            </div>
            <div className="flex-auto">
              <div className="uppercase text-gray-300 text-sm font-medium mb-1.5">
                Footer Icon URL
              </div>
              <input
                type="text"
                className="bg-dark-2 rounded p-2 w-full no-ring font-light"
              />
            </div>
          </div>
        </div>
      ) : undefined}
    </div>
  );
}
