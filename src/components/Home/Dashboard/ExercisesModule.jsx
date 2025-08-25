import { motion } from "framer-motion";
import { Heart } from "react-feather";

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

const ExercisesModule = ({ darkMode, activeSidebarItem = "breathing" }) => {
  // Filter exercises based on activeSidebarItem
  const getFilteredExercises = () => {
    switch (activeSidebarItem) {
      case "breathing":
        return exercises.filter(ex => ex.category === "Anxiety Relief");
      case "meditation":
        return exercises.filter(ex => ex.category === "Stress Reduction");
      case "mindfulness":
        return exercises.filter(ex => ex.category === "Mindfulness");
      case "progress":
        return exercises.filter(ex => ex.category === "Positive Thinking");
      default:
        return exercises;
    }
  };

  const filteredExercises = getFilteredExercises();

  return (
    <div
      className={`p-6 h-full overflow-auto ${
        darkMode ? "bg-transparent text-gray-100" : "bg-transparent text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${darkMode ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-green-400 to-emerald-500"}`}>
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Wellness Exercises
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {activeSidebarItem === "breathing" ? "Breathing & Anxiety Relief" :
               activeSidebarItem === "meditation" ? "Meditation & Stress Reduction" :
               activeSidebarItem === "mindfulness" ? "Mindfulness Practices" :
               activeSidebarItem === "progress" ? "Positive Thinking & Progress" : "All Wellness Exercises"}
            </p>
          </div>
        </div>
        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} available
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-2xl backdrop-blur-sm cursor-pointer transition-all duration-300 ${
              darkMode
                ? "bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700"
                : "bg-white/80 hover:bg-gray-50/80 border border-gray-200"
            } shadow-lg hover:shadow-xl`}
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
