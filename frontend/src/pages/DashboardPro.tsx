import AppShell from "../layout/AppShell";
import Sidebar from "../layout/Sidebar";
import Rightbar from "../layout/Rightbar";

export default function DashboardPro() {
  return (
    <AppShell sidebar={<Sidebar />} rightbar={<Rightbar />}>
      {/* Main dashboard widgets and cards go here */}
      <div className="mb-8">
        <div className="rounded-2xl bg-indigo-500 text-white p-8 flex flex-col gap-2 shadow-lg">
          <div className="text-sm font-semibold uppercase tracking-wide">Online Course</div>
          <div className="text-3xl font-bold mb-2">Sharpen Your Skills With Professional Online Courses</div>
          <button className="mt-2 w-max rounded-full bg-white text-indigo-600 px-6 py-2 font-semibold shadow">Join Now</button>
        </div>
      </div>
      <div className="mb-8">
        <div className="text-lg font-semibold mb-4">Continue Watching</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white p-4 shadow flex flex-col">
            <div className="h-32 bg-gray-100 rounded mb-3" />
            <div className="font-semibold mb-1">Beginner's Guide To Becoming A Professional Frontend Developer</div>
            <div className="text-xs text-gray-400 mb-2">Prashant Kumar Singh</div>
            <button className="text-indigo-600 text-xs font-semibold w-max">Show Details</button>
          </div>
          <div className="rounded-xl bg-white p-4 shadow flex flex-col">
            <div className="h-32 bg-gray-100 rounded mb-3" />
            <div className="font-semibold mb-1">Learn Software Development With Us!</div>
            <div className="text-xs text-gray-400 mb-2">Prashant Kumar Singh</div>
            <button className="text-indigo-600 text-xs font-semibold w-max">Show Details</button>
          </div>
          <div className="rounded-xl bg-white p-4 shadow flex flex-col">
            <div className="h-32 bg-gray-100 rounded mb-3" />
            <div className="font-semibold mb-1">How To Create Your Online Course Step 3</div>
            <div className="text-xs text-gray-400 mb-2">Prashant Kumar Singh</div>
            <button className="text-indigo-600 text-xs font-semibold w-max">Show Details</button>
          </div>
        </div>
      </div>
      {/* Add more widgets/cards as needed */}
    </AppShell>
  );
}
