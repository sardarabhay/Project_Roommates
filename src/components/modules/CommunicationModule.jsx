
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';

const CommunicationModule = () => (
  <div className="animate-fade-in">
    <ModuleHeader title="Communication Hub" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-bold text-lg mb-4">House Rules</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Quiet hours are from 11 PM to 7 AM on weeknights.</li>
          <li>Clean up common areas after use.</li>
          <li>Guests are welcome, but please give a heads-up for overnight stays.</li>
          <li>Label your food in the fridge.</li>
        </ul>
        <button className="text-sm text-teal-600 font-semibold mt-4">Edit Rules</button>
      </Card>
      <Card>
        <h3 className="font-bold text-lg mb-4">Bulletin Board</h3>
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm">Hey everyone, I'm having a package delivered on Friday, could you keep an eye out? - Chatur</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Posted 3 hours ago</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm">The mixer grinder seems to be making a weird noise. Let's not use it until we check it out. - Deepak</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Posted Yesterday</p>
          </div>
        </div>
        <input type="text" placeholder="Post a new message..." className="w-full mt-4 p-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </Card>
    </div>
  </div>
);

export default CommunicationModule;