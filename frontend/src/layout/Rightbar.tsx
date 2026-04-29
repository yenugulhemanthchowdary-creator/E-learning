import React from "react";

export default function Rightbar() {
  return (
    <div className="flex flex-col h-full py-8 px-6">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-2" />
        <div className="text-center font-semibold text-lg">Good Morning Prashant</div>
        <div className="text-center text-xs text-gray-400 mb-2">Continue Your Journey And Achieve Your Target</div>
        <div className="flex justify-center gap-2 mb-2">
          <button className="rounded-full bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-medium">🔔</button>
          <button className="rounded-full bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-medium">✉️</button>
          <button className="rounded-full bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-medium">📅</button>
        </div>
      </div>
      <div className="mb-8">
        <div className="font-semibold mb-2">Your Mentor</div>
        <ul className="space-y-2">
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div>
              <div className="font-medium text-sm">Prashant Kumar Singh</div>
              <div className="text-xs text-gray-400">Software Developer</div>
            </div>
            <button className="ml-auto text-indigo-600 text-xs font-semibold">Follow</button>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div>
              <div className="font-medium text-sm">Ravi Kumar</div>
              <div className="text-xs text-gray-400">Software Developer</div>
            </div>
            <button className="ml-auto text-indigo-600 text-xs font-semibold">Follow</button>
          </li>
        </ul>
        <button className="w-full mt-3 rounded-lg bg-indigo-50 text-indigo-600 py-2 font-semibold text-sm">See All</button>
      </div>
      <div>
        <div className="font-semibold mb-2">Progress</div>
        <div className="h-32 bg-indigo-100 rounded-lg" />
      </div>
    </div>
  );
}
