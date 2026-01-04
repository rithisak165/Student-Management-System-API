export default function StudentHelp() {
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6">How to use Student Portal</h1>
            <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                    <span className="font-bold text-blue-500">1.</span>
                    <span>To mark attendance, go to the <strong>Attendance</strong> page and click "Scan QR" when your teacher shows the code.</span>
                </li>
                <li className="flex gap-3">
                    <span className="font-bold text-blue-500">2.</span>
                    <span>Green rows in attendance mean you were Present. Red rows mean you were Absent.</span>
                </li>
                <li className="flex gap-3">
                    <span className="font-bold text-blue-500">3.</span>
                    <span>If you need to leave early or are sick, use the <strong>Requests</strong> page to ask for permission.</span>
                </li>
            </ul>
        </div>
    )
}