import { Canvas, useFrame } from '@react-three/fiber';
import { useState, useRef, useEffect, useMemo } from 'react';
import { OrbitControls, PerspectiveCamera, Sky, Environment, useGLTF, Text } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import Model1 from './Model1';
import Model2 from './Model2';

const MovingCarX = ({ position = [25, 0.1, 1.5], direction = -1, ...props }) => {
  const carRef = useRef();
  useFrame((state, delta) => {
    if (carRef.current) {
      carRef.current.setLinvel({ x: 5 * direction, y: 0, z: 0 });
    }
  });

  return (
    <RigidBody
      ref={carRef}
      position={position}
      name="movingCarX"
      colliders="hull"
      type="dynamic"
    >
      <group rotation={[0, direction > 0 ? -Math.PI/2 : Math.PI/2, 0]}>
        <Model1  {...props}/>
      </group>
    </RigidBody>
  );
};

const MovingCarZ = ({ position = [1.5, -0.1, 25], direction = -1, ...props }) => {
  const carRef = useRef();
  
  useFrame((state, delta) => {
    if (carRef.current) {
      carRef.current.setLinvel({ x: 0, y: 0, z: 5 * direction });
    }
  });

  return (
    <RigidBody
      ref={carRef}
      position={position}
      name="movingCarZ"
      colliders="hull"
      type="dynamic"
    >
      <group rotation={[0, direction > 0 ? Math.PI : 0, 0]}>
        <Model2 {...props}/>
      </group>
    </RigidBody>
  );
};

const StationaryCar = ({ position, rotation = [0, 0, 0] }) => {
  const carRef = useRef();
  const [collided, setCollided] = useState(false);
  
  useEffect(() => {
    if (carRef.current) {
      carRef.current.setMass(1000);
      
      const unsubscribe = carRef.current.onCollisionEnter(() => {
        setCollided(true);
        setTimeout(() => setCollided(false), 5000);
      });
      
      return unsubscribe;
    }
  }, []);
  
  return (
    <RigidBody 
    ref={carRef} 
    position={position} 
    name="stationaryCar"
    type="kinematicPosition" // Prevents physics interactions
    restitution={0.2}
    friction={0.1}
  >
    <group rotation={rotation}>
      <Model2 />
    </group>
  </RigidBody>
  
  );
};

const useViewportSize = () => {
    const [viewport, setViewport] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768
    });
    
    useEffect(() => {
      const handleResize = () => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 768
        });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return viewport;
  };
  
  // Scale factor based on viewport width
  const useScaleFactor = () => {
    const viewport = useViewportSize();
    
    // Calculate scale factor - decrease scale as viewport gets smaller
    const scaleFactor = useMemo(() => {
      if (viewport.width < 480) return 0.1; // Small mobile
      if (viewport.width < 768) return 0.75; // Medium mobile
      if (viewport.width < 1024) return 0.85; // Tablet
      return 1; // Desktop
    }, [viewport.width]);
    
    return scaleFactor;
  };

// Central Traffic Light
const CentralTrafficLight = () => {   
    const [lightStateX, setLightStateX] = useState('grey');
    const [lightStateZ, setLightStateZ] = useState('green');
    
    useEffect(() => {
      const timer = setInterval(() => {
        setLightStateX(prev => {
          if (prev === 'red') return 'green';
          if (prev === 'green') return 'yellow';
          return 'red';
        });
        
        setLightStateZ(prev => {
          if (prev === 'green') return 'yellow';
          if (prev === 'yellow') return 'red';
          return 'green';
        });
      }, 8000);
      
      return () => clearInterval(timer);
    }, []);
    
    return (
      <>
        {/* X-axis (East-West) traffic lights */}
        {/* East side */}
        <group position={[6, 0, 4.5]}>
          {/* Central pole */}
          <mesh position={[1, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 16]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          
         
          <TrafficLightHead 
            position={[0, 4, 0]} 
            rotation={[0, Math.PI/2, 0]} 
            lightState={lightStateX} 
          />
        </group>
        
        {/* West side */}
        <group position={[-6, 0, -4.5]}>
          {/* Central pole */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 16]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          
          <TrafficLightHead 
            position={[1, 4, 0]} 
            rotation={[0, -Math.PI/2, 0]} 
            lightState={lightStateX} 
          />
        </group>
        
        {/* Z-axis (North-South) traffic lights */}
        {/* North side */}
        <group position={[-4.5, 0, 6]}>
          {/* Central pole */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 16]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          
          <TrafficLightHead 
            position={[0, 4, -1]} 
            rotation={[0, 0, 0]} 
            lightState={lightStateZ} 
          />
        
        </group>
        
        {/* South side */}
        <group position={[5.0, 0, -5]}>
          {/* Central pole */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4, 16]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          
          <TrafficLightHead 
            position={[0, 4, 1]} 
            rotation={[0, Math.PI, 0]} 
            lightState={lightStateZ} 
          />
          
        </group>
      </>
    );
  };

// Individual traffic light head
const TrafficLightHead = ({ position, rotation, lightState }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 1.5]} castShadow>
        <boxGeometry args={[1, 2.5, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Red light */}
      <mesh position={[0, 0.8, 1.8]} castShadow>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial 
          color="Gray" 
          emissive="Gray"
          emissiveIntensity={lightState === 'Gray' ? 1 : 0.2} 
        />
      </mesh>
      
      {/* Yellow light */}
      <mesh position={[0, 0, 1.8]} castShadow>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial 
          color="Gray" 
          emissive="Gray"
          emissiveIntensity={lightState === 'Gray' ? 1 : 0.2} 
        />
      </mesh>
      
      {/* Green light */}
      <mesh position={[0, -0.8, 1.8]} castShadow>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial 
          color="Gray" 
          emissive="Gray"
          emissiveIntensity={lightState === 'green' ? 1 : 0.2} 
        />
      </mesh>
    </group>
  );
};


// Tree decoration
const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <coneGeometry args={[1, 3, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
};

const Lamppost = ({ position }) => {
  return (
    <group position={position} castShadow>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 4, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, 4, 0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[0, 4, 0.6]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

// Building
const Building = ({ position, height = 6, width = 2, depth = 3, color = "#b9c4d0" }) => {
  const floors = Math.floor(height / 1.5);

  const windowLights = useMemo(() => {
    return Array.from({ length: floors * 4 }).map(() => Math.random() > 0.3);
  }, [floors]);
  
  return (
    <group position={position}>
      {/* Building Structure */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={new THREE.Color(color)} />
      </mesh>
      
      {/* Windows */}
      {Array.from({ length: floors }).map((_, floorIndex) => (
        <group key={`floor-${floorIndex}`} position={[0, floorIndex * 1.5 + 1, 0]}>
          {Array.from({ length: 2 }).map((_, i) => (
            <mesh 
              key={`front-${i}`} 
              position={[width * (i === 0 ? -0.25 : 0.25), 0, depth / 2 + 0.01]} 
              castShadow
            >
              <planeGeometry args={[0.5, 0.9]} />
              <meshStandardMaterial 
                color={new THREE.Color("#88ccff")} 
                emissive={new THREE.Color("#ffffaa")} 
                emissiveIntensity={windowLights[floorIndex * 4 + i] ? 0.5 : 0} 
              />
            </mesh>
          ))}
          
          {/* Side Windows */}
          {Array.from({ length: 2 }).map((_, i) => (
            <mesh 
              key={`side-${i}`} 
              position={[width / 2 + 0.01, 0, depth * (i === 0 ? -0.25 : 0.25)]}
              rotation={[0, Math.PI / 2, 0]} 
              castShadow
            >
              <planeGeometry args={[0.5, 0.8]} />
              <meshStandardMaterial 
                color={new THREE.Color("#88ccff")} 
                emissive={new THREE.Color("#ffffaa")} 
                emissiveIntensity={windowLights[floorIndex * 4 + 2 + i] ? 0.5 : 0} 
              />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Roof */}
      <mesh position={[0, height + 0.1, 0]} castShadow>
        <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
        <meshStandardMaterial color={new THREE.Color("#555555")} />
      </mesh>
    </group>
  );
};

// Crossroads
const CrossRoads = () => {
  return (
    <group>
      {/* X-axis road */}
      <RigidBody type='fixed'>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[90, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>
      
      {/* Z-axis road */}
      <RigidBody type='fixed'>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]} receiveShadow>
          <planeGeometry args={[8, 100]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>
      
      {/* Road markings - X-axis center divider */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[90, 0.2]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      
      {/* Road markings - Z-axis center divider */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[0.2, 90]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      
      {/* X-axis dashed lane markings */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-x-pos-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[i * 2, -0.08, 2]} 
        >
          <planeGeometry args={[1, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-x-neg-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-i * 2, -0.08, 2]} 
        >
          <planeGeometry args={[1, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-x-pos-bottom-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[i * 2, -0.08, -2]} 
        >
          <planeGeometry args={[1, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-x-neg-bottom-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-i * 2, -0.08, -2]} 
        >
          <planeGeometry args={[1, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      
      {/* Z-axis dashed lane markings */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-z-pos-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[2, -0.08, i * 2]} 
        >
          <planeGeometry args={[0.1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-z-neg-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[2, -0.08, -i * 2]} 
        >
          <planeGeometry args={[0.1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-z-pos-left-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-2, -0.08, i * 2]} 
        >
          <planeGeometry args={[0.1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh 
          key={`dash-z-neg-left-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-2, -0.08, -i * 2]} 
        >
          <planeGeometry args={[0.1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      
      {/* Sidewalks */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-4.5, 0.1, 0]} receiveShadow>
          <boxGeometry args={[1, 0.3, 0]} />
          <meshStandardMaterial color="#cc8866" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[4.5, 0.1, 0]} receiveShadow>
          <boxGeometry args={[1, 0.3, 0]} />
          <meshStandardMaterial color="#cc8866" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.1, -4.5]} receiveShadow>
          <boxGeometry args={[0, 0.3, 1]} />
          <meshStandardMaterial color="#cc8866" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.1, 4.5]} receiveShadow>
          <boxGeometry args={[0, 0.3, 1]} />
          <meshStandardMaterial color="#cc8866" />
        </mesh>
      </RigidBody>
      
      {/* Grass areas in the four quadrants */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, -0.15, -25]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4a7942" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, -0.15, -25]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4a7942" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, -0.15, 25]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4a7942" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, -0.15, 25]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4a7942" />
      </mesh>
      
      {/* Invisible barriers */}
      <CuboidCollider position={[-5.5, 1, 0]} args={[0.5, 2, 50]} type="fixed" />
      <CuboidCollider position={[5.5, 1, 0]} args={[0.5, 2, 50]} type="fixed" />
      <CuboidCollider position={[0, 1, -5.5]} args={[50, 2, 0.5]} type="fixed" />
      <CuboidCollider position={[0, 1, 5.5]} args={[50, 2, 0.5]} type="fixed" />
    </group>
  );
};

const Scene = (props) => {
    // Track viewport width for responsiveness
    const [width, setWidth] = useState(window.innerWidth);
    
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Calculate scale factor based on viewport width
    const getScaleFactor = () => {
      if (width < 480) return 0.5; // Small mobile
      if (width < 768) return 0.75; // Medium mobile
      if (width < 1024) return 0.85; // Tablet
      return 1; // Desktop
    };
    
    return (
      <Canvas shadows frameloop="always">
        <Sky sunPosition={[10, 5, -5]} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 10, -5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={2048} 
        />
        <fog attach="fog" args={['#aabbdd', 10, 80]} />
        
        {/* Apply scale to this group containing all scene content */}
        <group scale={getScaleFactor()}>
          <Physics gravity={[0, -9.8, 0]}>
            <CrossRoads />
            
            {/* Central traffic light */}
            <CentralTrafficLight position={[0, 0, 0]} />
            
            {/* Cars on X-axis road */}
            <MovingCarX position={[25, -0.1, -1.7]} direction={-1}  {...props} />
            <MovingCarX position={[-25, -0.1, 1.5]} direction={1}  {...props} />
            
            {/* Cars on Z-axis road */}
            <MovingCarZ position={[1.5, -0.1, -25]} direction={1} {...props}/>
            <MovingCarZ position={[-1.5, -0.1, 25]} direction={-1} {...props}/>
            
            {/* Stationary cars */}
            <StationaryCar position={[-3, -0.1, -15]} rotation={[0, Math.PI, 0]} />
            <StationaryCar position={[20, -0.1, 3]} rotation={[0, Math.PI/2, 0]} />
  
          </Physics>
          
          {/* Buildings in each quadrant */}
          {/* Northeast quadrant */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Building 
              key={`building-ne-${i}`}
              position={[10 + i * 5, 0, 10 + i * 3]} 
              height={5 + Math.random() * 5}
              width={2 + Math.random()}
              depth={2 + Math.random() * 2}
              color={`rgb(${180 + Math.random() * 50}, ${180 + Math.random() * 50}, ${180 + Math.random() * 50})`}
            />
          ))}
          
          {/* Northwest quadrant */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Building 
              key={`building-nw-${i}`}
              position={[-10 - i * 5, 0, 10 + i * 3]} 
              height={5 + Math.random() * 5}
              width={2 + Math.random()}
              depth={2 + Math.random() * 2}
              color={`rgb(${180 + Math.random() * 50}, ${180 + Math.random() * 50}, ${180 + Math.random() * 50})`}
            />
          ))}
          
          {/* Southeast quadrant */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Building 
              key={`building-se-${i}`}
              position={[10 + i * 5, 0, -10 - i * 3]} 
              height={5 + Math.random() * 5}
              width={2 + Math.random()}
              depth={2 + Math.random() * 2}
              color={`rgb(${180 + Math.random() * 50}, ${180 + Math.random() * 50}, ${180 + Math.random() * 50})`}
            />
          ))}
          
          {/* Southwest quadrant */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Building 
              key={`building-sw-${i}`}
              position={[-10 - i * 5, 0, -10 - i * 3]} 
              height={5 + Math.random() * 5}
              width={2 + Math.random()}
              depth={2 + Math.random() * 2}
              color={`rgb(${180 + Math.random() * 50}, ${180 + Math.random() * 50}, ${180 + Math.random() * 50})`}
            />
          ))}
          
          {/* Lampposts */}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-x-pos-${i}`} position={[5 + i * 10, 0, 4]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-x-neg-${i}`} position={[-5 - i * 10, 0, 4]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-x-pos-neg-${i}`} position={[5 + i * 10, 0, -4]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-x-neg-neg-${i}`} position={[-5 - i * 10, 0, -4]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-z-pos-${i}`} position={[4, 0, 5 + i * 10]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-z-neg-${i}`} position={[4, 0, -5 - i * 10]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Lamppost key={`lamp-z-pos-neg-${i}`} position={[-4, 0, 5 + i * 10]} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <Lamppost key={`lamp-z-neg-neg-${i}`} position={[-4, 0, -5 - i * 10]} />
          ))}
          
          {/* Trees */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Tree 
              key={`tree-ne-${i}`} 
              position={[4 + Math.random() * 30, 0, 8 + Math.random() * 30]} 
              scale={0.7 + Math.random() * 0.5}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <Tree 
              key={`tree-nw-${i}`} 
              position={[-8 - Math.random() * 30, 0, 8 + Math.random() * 30]} 
              scale={0.7 + Math.random() * 0.5}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <Tree 
              key={`tree-se-${i}`} 
              position={[6 + Math.random() * 30, 0, -8 - Math.random() * 30]} 
              scale={0.7 + Math.random() * 0.5}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <Tree 
              key={`tree-sw-${i}`} 
              position={[-8 - Math.random() * 30, 0, -8 - Math.random() * 30]} 
              scale={0.7 + Math.random() * 0.5}
            />
          ))}
        </group>
        
        <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={60} />
      </Canvas>
    );
  };
  

export default function CrossroadScene(props) {
  return <Scene {...props}/>;
}