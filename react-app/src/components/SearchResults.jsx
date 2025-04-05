import { FiBookOpen, FiGithub } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";

const resources = [
    {
      type: "Article",
      title: "ML | Data Preprocessing in Python | GeeksforGeeks",
      description: "Data Preprocessing for Machine Learning | Classical Machine Learning",
      date: "Jan 17, 2025",
      icon: <FiBookOpen size={24} className="text-gray-600" />,
    },
    {
      type: "YouTube Video",
      title: "Hyperparameters Tuning: Grid Search vs Random Search",
      description: "Hyperparameter Tuning Techniques | Classical Machine Learning",
      date: "Jan 17, 2025",
      icon: <FaYoutube size={24} className="text-gray-600" />,
    },
    {
      type: "Github Repository",
      title: "sayantann11/all-classification-templetes-for-ML",
      description: "Implementing Feature Scaling with Scikit-Learn | Classical Machine Learning",
      date: "Jan 17, 2025",
      icon: <FiGithub size={24} className="text-gray-600" />,
    },
    {
      type: "YouTube Video",
      title: "ML | Data Preprocessing in Python | GeeksforGeeks",
      description: "Classical Machine Learning",
      date: "Jan 17, 2025",
      icon: <FaYoutube size={24} className="text-gray-600" />,
    },
    {
      type: "YouTube Video",
      title: "ML | Data Preprocessing in Python | GeeksforGeeks",
      description: "Classical Machine Learning",
      date: "Jan 17, 2025",
      icon: <FaYoutube size={24} className="text-gray-600" />,
    },
];


export default function SearchResults() {
    return (  
        <div className="space-y-3">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="group p-3 flex gap-3 border rounded-md shadow-sm bg-white relative"
                >
                  <p className="absolute top-3 right-3 text-gray-500 text-xs">{resource.date}</p>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shrink-0">
                    <div className="flex items-center justify-center w-full h-full">
                      {resource.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">{resource.type}</p>
                    <p className="text-emerald-300 text-base font-semibold truncate">{resource.title}</p>
                    <p className="text-gray-600 text-xs truncate">{resource.description}</p>
                  </div>
                </div>
              ))}
        </div>
    );
}