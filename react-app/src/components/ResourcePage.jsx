import { FaYoutube } from "react-icons/fa";
import { useState } from 'react';

export default function Resource() {
  const [activeTab, setActiveTab] = useState('summary');
  
  return (

      <div className="bg-white p-8 rounded-xl shadow-md">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-6 items-center mb-6">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-300 shrink-0 transition-colors duration-200 group-hover:border-emerald-300">
                            <FaYoutube className="w-10 h-10 text-emerald-300" />
                          </div>
                            <div>
                              <h2 className="text-xl font-semibold text-gray-800">
                                YouTube Video
                              </h2>
                              <p className="text-emerald-300 font-semibold">
                                Data Cleaning/Data Preprocessing Before Building a Model - A Comprehensive Guide
                              </p>
                              <p className="text-gray-500 text-sm">
                                Data Preprocessing for Machine Learning | Classical Machine Learning
                              </p>
                            </div>
                        </div>
                          <p className="text-sm text-gray-500 pt-1">Jan 17, 2025</p>
                      </div>

                        <iframe
                          className="w-full rounded-md mb-8"
                          style={{ height: '500px' }}
                          src="https://www.youtube.com/embed/GP-2634exqA"
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                        
                        <div className="border-b border-gray-300 mb-2 flex gap-4 text-sm font-semibold">
                          <button
                            onClick={() => setActiveTab('summary')}
                            className={`pb-1 ${
                              activeTab === 'summary'
                                ? 'text-emerald-300 border-b-2 border-emerald-300'
                                : 'text-gray-500'
                            }`}
                          >
                            Generated Summary
                          </button>
                          <button
                            onClick={() => setActiveTab('details')}
                            className={`pb-1 ${
                              activeTab === 'details'
                                ? 'text-emerald-300 border-b-2 border-emerald-300'
                                : 'text-gray-500'
                            }`}
                          >
                            Resource Details
                          </button>
                        </div>

                        <div className="text-sm text-gray-700 space-y-3">
                          {activeTab === 'summary' && (
                            <>
                              <p>
                                Doggo ipsum i am bekom fat most angery pupper I have ever seen you are doing me a frighten. 
                                Porgo ur givin me a spook smol very jealous pupper blep puggo, fluffer shibe heckin good boys and girls...
                              </p>
                              <p>
                                Big ol ur givin me a spook smol blop, porgo I am bekom fat wow such tempt...
                              </p>
                            </>
                          )}
                          {activeTab === 'details' && (
                            <>
                              <p>Resource details...</p>
                            </>
                          )}
                        </div>

                    </div>
    
  );
}