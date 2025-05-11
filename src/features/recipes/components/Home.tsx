import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import { ChevronRight, ClipboardList, BarChart, Clock, PlusCircle, Croissant } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: 'Recipe Creator',
      description: 'Design custom bread recipes with precise control over ingredients and process.',
      icon: ClipboardList,
      color: 'bg-bread-dark-moss-green text-bread-cornsilk',
      path: '/recipes',
    },
    {
      title: 'Timings Tracker',
      description: 'Track each stage of your bread baking process in real-time.',
      icon: Clock,
      color: 'bg-bread-earth-yellow text-bread-dark-moss-green',
      path: '/timings',
    },
    {
      title: 'Bake Analysis',
      description: 'Learn from past bakes to improve your bread making skills.',
      icon: BarChart,
      color: 'bg-bread-tigers-eye text-bread-dark-moss-green',
      path: '/analysis',
    },
  ];
  
  return (
    <Layout>
      <div className="pt-6 pb-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Croissant size={64} className="mx-auto text-bread-pakistan-green mb-4" />
          <h1 className="font-serif text-4xl sm:text-5xl text-bread-pakistan-green font-bold mb-4">
            BreadMaster
          </h1>
          <p className="text-xl text-bread-pakistan-green max-w-2xl mx-auto">
            Track, improve, and perfect your bread baking with precision and ease.
          </p>
          
          <Button
            variant="primary"
            size="lg"
            className="mt-8"
            onClick={() => navigate('/recipes')}
            icon={<PlusCircle size={20} />}
          >
            Start Baking
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card interactive onClick={() => navigate(feature.path)} className="h-full flex flex-col">
                <div className="p-6 flex flex-col flex-1 min-h-[340px]">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon size={24} className="text-white" />
                  </div>
                  
                  <h2 className="font-serif text-xl font-semibold text-bread-brown-800 mb-2">
                    {feature.title}
                  </h2>
                  
                  <p className="text-bread-pakistan-green mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-bread-crust font-medium">
                    Explore <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 bg-bread-brown-100 rounded-lg p-6 sm:p-8">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="font-serif text-2xl sm:text-3xl text-bread-brown-800 font-semibold mb-4">
      How BreadMaster Works
    </h2>
    <p className="text-bread-pakistan-green mb-8">
      BreadMaster guides you through the essential steps of bread baking, from inspiration to analysis. Here's how it works:
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <div className="flex flex-col items-center flex-1">
        <ClipboardList size={40} className="mb-2 text-bread-dark-moss-green" />
        <span className="font-semibold text-bread-brown-800 mb-1">Create Recipe</span>
        <span className="text-bread-pakistan-green text-sm">Design your custom bread recipe with full control over ingredients and baker's percentages.</span>
      </div>
      <div className="hidden sm:flex flex-col items-center flex-shrink-0">
        <ChevronRight size={32} className="text-bread-crust" />
      </div>
      <div className="flex flex-col items-center flex-1">
        <Clock size={40} className="mb-2 text-bread-dark-moss-green" />
        <span className="font-semibold text-bread-brown-800 mb-1">Track Timings</span>
        <span className="text-bread-pakistan-green text-sm">Monitor each stage of your bake in real time and never miss a step.</span>
      </div>
      <div className="hidden sm:flex flex-col items-center flex-shrink-0">
        <ChevronRight size={32} className="text-bread-crust" />
      </div>
      <div className="flex flex-col items-center flex-1">
        <BarChart size={40} className="mb-2 text-bread-dark-moss-green" />
        <span className="font-semibold text-bread-brown-800 mb-1">Analyze Results</span>
        <span className="text-bread-pakistan-green text-sm">Review your bake data and learn how to improve your bread-making skills.</span>
      </div>
    </div>
  </div>
</div>
      </div>
    </Layout>
  );
};

export default Home;
