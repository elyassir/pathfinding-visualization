import { Button, Flex, SegmentedControl, Select, Slider } from '@radix-ui/themes';
import { useTheme } from '../../themes/ThemeContext'
import { BrickWall, BrushCleaning, Flag, MapPin, Play, RotateCcw, Square, TextAlignStart, TextAlignStartIcon, Trash, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

import DashboardGrid from './components/DashboardGrid'
const tools = [
    { id: 'wall', icon: BrickWall, label: 'Wall' },
    { id: 'start', icon: MapPin, label: 'Start' },
    { id: 'end', icon: Flag, label: 'End' },
    { id: 'empty', icon: Square, label: 'Erase' },
];

const algorithms = [
    { id: 'dijkstra', label: "Dijkstra's Algorithm" },
    { id: 'astar', label: 'A* Search' },
    { id: 'bfs', label: 'Breadth-First Search' },
    { id: 'dfs', label: 'Depth-First Search' },
    { id: 'greedy', label: 'Greedy Best-First Search' },
];

export default function Dashboard() {
    const [selectedTool, setSelectedTool] = useState('wall');
    const [speed, setSpeed] = useState([50]);
    const { theme, toggleTheme } = useTheme();
    const [isRunning, setIsRunning] = useState(false);
    const [selectAlgo, setSelectAlgo] = useState('dijkstra');


    const handleSelect = (tool) => {
        if (tool === selectedTool) {
            setSelectedTool(null);
            return;
        }
        setSelectedTool(tool);
    };

    return <main className="flex flex-col h-screen p-0">
        <header className='flex justify-between items-center border-b border-gray-300 dark:border-gray-700'>
            <div className='flex items-center gap-6 p-4'>
                <svg className='text-(--primary-color)'
                    fill="none"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                    width="38"
                    height="38"
                >
                    <g clip-path="url(#clip0_6_319)">
                        <path
                            d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                            fill="currentColor"></path>
                    </g>
                    <defs>
                        <clipPath id="clip0_6_319">
                            <rect fill="white" height="48" width="48"></rect>
                        </clipPath>
                    </defs>
                </svg>

                <h1 className="text-2xl font-bold">
                    Pathfinding Visualizer
                </h1>

            </div>

            <div className='text-lg font-semibold'>
                <ul className='flex gap-8 p-4 items-center '>
                    <button onClick={toggleTheme} className="text-2xl cursor-pointer">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </ul>
            </div>
        </header>
        <div className='flex flex-1 overflow-hidden'>
            {/* Main content */}
            <aside className='w-80 border-gray-300 dark:border-gray-700'>

                <div className='pl-6 pt-8 flex flex-col gap-6'>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Pathfinding Algorithm</h2>
                        <Flex direction="column" className="w-full"> {/* removed maxWidth */}
                            <Select.Root
                                size="3"
                                value={selectAlgo}
                                onValueChange={(value) => setSelectAlgo(value)} // use onValueChange, not onClick
                                className="w-full"
                            >
                                <Select.Trigger className="w-full" aria-label="Select Pathfinding Algorithm" />
                                <Select.Content position="popper" className="w-full">
                                    {algorithms.map((algo) => (
                                        <Select.Item key={algo.id} value={algo.id}>
                                            {algo.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Maze Generation</h2>
                        <Flex direction="column" className="w-full"> {/* removed maxWidth */}
                            <Select.Root size="3" className="w-full">
                                <Select.Trigger placeholder="Select Maze Algorithm" className="w-full" aria-label="Select Maze Algorithm" />
                                <Select.Content position="popper" className="w-full">

                                    <Select.Item value="recursive-backtracking">Recursive Backtracking</Select.Item>
                                    <Select.Item value="randomized-prim">Randomized Prim's</Select.Item>
                                    <Select.Item value="randomized-kruskal">Randomized Kruskal's</Select.Item>
                                    <Select.Item value="hunt-and-kill">Hunt and Kill</Select.Item>
                                    <Select.Item value="sidewinder">Sidewinder</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    </div>

                    {/* Editing Tools */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                            Editing Tools
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <Button
                                        variant={tool.id === selectedTool ? 'solid' : 'outline'}
                                        key={tool.id}
                                        onClick={() => handleSelect(tool.id)}
                                        size={'3'}
                                        title={tool.title}
                                    >
                                        <Icon size={24} />
                                        <span className="text-xs font-medium">{tool.label}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    <div>

                        <h2 className="text-lg font-semibold mb-2">Controls</h2>
                        <Button variant="primary" size="4" className="w-full! cursor-pointer!" disabled={isRunning} onClick={() => setIsRunning(true)}>
                            <Play />
                            Visualize
                        </Button>

                    </div>

                    {/* <Flex align="center" gap="3" className="" width={"100%"} justify={'center'}>
              <Button color='gray' variant="outline"> <BrushCleaning width={20} /> Clear Walls</Button>
              <Button color='gray' variant="outline"> <RotateCcw width={20} /> Reset Board</Button>
            </Flex> */}
                    {/* Speed Control */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Speed
                            </h2>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Zap size={14} />
                                <span>{speed[0]}%</span>
                            </div>
                        </div>
                        <Slider
                            value={speed}
                            onValueChange={setSpeed}
                            min={10}
                            max={100}
                            step={10}
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
                            <span>Slow</span>
                            <span>Fast</span>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                        <Flex direction="column" gap="2" px={'4'}>
                            <Button
                                variant="outline"
                                size="2"
                                className="w-full cursor-pointer"
                                color="gray"

                            >
                                <Trash2 size={18} />
                                Clear Walls
                            </Button>
                            <Button
                                variant="outline"
                                size="2"
                                className="w-full cursor-pointer"
                                color="gray"
                            >
                                <RotateCcw size={18} />
                                Reset Board
                            </Button>
                        </Flex>
                    </div>

                    <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                    </div>

                </div>

            </aside>
            {/* Main Grid Area */}
            <DashboardGrid selectedTool={selectedTool} selectedAlgorithm={selectAlgo} isRunning={isRunning} setIsRunning={setIsRunning} />
        </div>
    </main >
}