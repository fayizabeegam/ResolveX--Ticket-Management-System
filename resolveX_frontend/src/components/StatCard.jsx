const StatCard = ({ title, value }) => {

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full">

      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-2xl font-bold">
        {value ?? 0}
      </h2>

    </div>
  );

};

export default StatCard;