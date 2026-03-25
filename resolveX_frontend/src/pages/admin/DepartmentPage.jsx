import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaThList } from "react-icons/fa";

const DepartmentPage = () => {
  const navigate = useNavigate();
  const cards = [
    {
      title: "Create Department",
      icon: <FaPlusCircle className="text-4xl" />,
      onClick: () => navigate("/departments/create"),
      bg: "bg-gradient-to-br from-indigo-600 to-indigo-500",
    },
    {
      title: "All Departments",
      icon: <FaThList className="text-4xl" />,
      onClick: () => navigate("/departments/all"),
      bg: "bg-gradient-to-br from-purple-600 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 md:px-8 bg-gray-100">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-gray-800">
        Department Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className={`${card.bg} cursor-pointer rounded-2xl shadow-xl hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center p-12 text-white`}
          >
            {card.icon}
            <h2 className="mt-6 text-2xl font-semibold">{card.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentPage;