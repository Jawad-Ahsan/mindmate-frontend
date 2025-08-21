import { motion } from "framer-motion";

const exercises = [
  {
    id: 1,
    title: "Breathing Exercise",
    duration: "5 min",
    description: "Calm your mind with controlled breathing",
    category: "Anxiety Relief",
  },
  {
    id: 2,
    title: "Body Scan",
    duration: "10 min",
    description: "Progressive muscle relaxation technique",
    category: "Stress Reduction",
  },
  {
    id: 3,
    title: "Gratitude Journal",
    duration: "7 min",
    description: "Focus on positive aspects of your life",
    category: "Positive Thinking",
  },
  {
    id: 4,
    title: "Mindful Walking",
    duration: "15 min",
    description: "Practice mindfulness while walking",
    category: "Mindfulness",
  },
];

const ExercisesModule = ({ darkMode }) => {
  return (
    <div
      className={`p-6 h-full overflow-auto ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-6 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Mental Health Exercises
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-xl ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-white hover:bg-gray-50"
            } shadow-md cursor-pointer transition-all duration-200`}
          >
            <div
              className={`w-14 h-14 rounded-2xl ${
                darkMode ? "bg-gray-700" : "bg-blue-100"
              } flex items-center justify-center mb-4 text-2xl`}
            >
              {exercise.category === "Anxiety Relief" && "🧘‍♂️"}
              {exercise.category === "Stress Reduction" && "💆‍♀️"}
              {exercise.category === "Positive Thinking" && "🙏"}
              {exercise.category === "Mindfulness" && "🚶‍♂️"}
            </div>
            <h3
              className={`text-lg font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {exercise.title}
            </h3>
            <p
              className={`text-sm mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {exercise.description}
            </p>
            <div className="flex justify-between items-center">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-gray-700 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {exercise.category}
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {exercise.duration}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExercisesModule;
