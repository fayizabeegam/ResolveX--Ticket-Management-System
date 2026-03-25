import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import api from "../api/axios";

const Notifications = () => {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("tickets/notifications/")
      .then(res => {
        setNotifications(res.data.notifications);
      })
      .catch(err => console.log(err));
  }, []);

  return (

    <div className="bg-gray-100 min-h-screen px-4 sm:px-6 lg:px-10 py-6">

      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center gap-3">
        <FaBell className="text-blue-600 text-2xl sm:text-3xl" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Notifications
        </h1>
      </div>

      {/* Notification Container */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">

        {notifications.length === 0 ? (

          <div className="flex flex-col items-center justify-center p-12 text-gray-500">

            <FaBell className="text-5xl mb-4 text-gray-400" />

            <p className="text-lg font-semibold">
              No notifications yet
            </p>

            <p className="text-sm text-gray-400 mt-1 text-center">
              When something happens in your account,
              you'll see it here.
            </p>

          </div>

        ) : (

          notifications.map((n) => (

            <div
              key={n.id}
              className={`flex gap-4 p-4 sm:p-5 border-b last:border-none transition hover:bg-gray-50 ${
                !n.is_read ? "bg-blue-50" : ""
              }`}
            >

              {/* Icon */}
              <div className="flex-shrink-0">

                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <FaBell />
                </div>

              </div>

              {/* Content */}
              <div className="flex-1">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">

                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {n.title}
                  </h3>

                  <span className="text-xs text-gray-400 mt-1 sm:mt-0">
                    {new Date(n.created_at).toLocaleString()}
                  </span>

                </div>

                <p className="text-gray-600 text-sm mt-1">
                  {n.message}
                </p>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
};

export default Notifications;