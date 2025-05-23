
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const colors = {
  building: "#1A1F2C",
  ground: "#0A0A0A",
  highlight: "#1EAEDB",
  person1: "#33C3F0",
  person2: "#0F4C81",
};

interface BuildingProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

interface PersonProps {
  position: [number, number, number];
  color: string;
  moveTo: [number, number, number];
  speed: number;
}

interface QrHighlightProps {
  position: [number, number, number];
}

const IsometricPremises = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1; // Slow rotation
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />
      <PerspectiveCamera makeDefault position={[10, 10, 10]} />

      <group ref={groupRef} scale={1.5}>
        {/* Ground - wider area */}
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[30, 1, 30]} />
          <meshStandardMaterial color={colors.ground} />
        </mesh>

        {/* Main Building - larger */}
        <Building position={[0, 2.5, 0]} scale={[4, 5, 4]} color={colors.building} />
        
        {/* Secondary Buildings - more spread out */}
        <Building position={[-10, 1.8, -4]} scale={[3, 3.5, 3]} color={colors.building} />
        <Building position={[9, 1.2, -6]} scale={[2.5, 3, 2.5]} color={colors.building} />
        <Building position={[-6, 1.5, 8]} scale={[2, 2.5, 2]} color={colors.building} />
        <Building position={[7, 1, 5]} scale={[2.2, 2.8, 2.2]} color={colors.building} />
        <Building position={[-3, 0.8, -8]} scale={[1.5, 2, 1.5]} color={colors.building} />
        
        {/* Moving People - more people and wider paths */}
        <Person position={[4, 0, 5]} color={colors.person1} moveTo={[-7, 0, 5]} speed={1} />
        <Person position={[-6, 0, -4]} color={colors.person2} moveTo={[7, 0, -5]} speed={0.7} />
        <Person position={[0, 0, 8]} color={colors.highlight} moveTo={[0, 0, -9]} speed={1.3} />
        <Person position={[8, 0, -2]} color={colors.person1} moveTo={[-6, 0, -3]} speed={0.9} />
        <Person position={[-5, 0, 6]} color={colors.person2} moveTo={[6, 0, 8]} speed={1.1} />
        <Person position={[9, 0, 3]} color={colors.person1} moveTo={[-8, 0, 1]} speed={0.8} />
        <Person position={[-3, 0, -7]} color={colors.highlight} moveTo={[5, 0, -7]} speed={1.2} />
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
};

// Building component
const Building = ({ position, scale, color }: BuildingProps) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} />
      <QrHighlight position={[0, scale[1]/2 + 0.5, scale[2]/2 + 0.1]} />
    </mesh>
  );
};

// QR Code highlight
const QrHighlight = ({ position }: QrHighlightProps) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.scale.x = 0.5 + Math.sin(state.clock.elapsedTime) * 0.1;
      ref.current.scale.y = 0.5 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <mesh position={position} ref={ref}>
      <boxGeometry args={[0.5, 0.5, 0.1]} />
      <meshStandardMaterial 
        color={colors.highlight} 
        emissive={colors.highlight} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  );
};

// Moving Person component
const Person = ({ position, color, moveTo, speed }: PersonProps) => {
  const ref = useRef<THREE.Group>(null);
  const dir = useRef(1);
  const startPos = useRef(new THREE.Vector3(...position));
  const endPos = useRef(new THREE.Vector3(...moveTo));
  
  useFrame((state, delta) => {
    if (ref.current) {
      const targetPos = dir.current > 0 ? endPos.current : startPos.current;
      ref.current.position.lerp(targetPos, delta * speed);
      
      // Check if reached target
      if (ref.current.position.distanceTo(targetPos) < 0.1) {
        dir.current *= -1; // Reverse direction
      }
      
      // Rotate the person in the direction of movement
      const lookAtPos = dir.current > 0 ? endPos.current : startPos.current;
      const lookDirection = new THREE.Vector3().subVectors(lookAtPos, ref.current.position);
      if (lookDirection.length() > 0.1) {
        const angle = Math.atan2(lookDirection.x, lookDirection.z);
        ref.current.rotation.y = angle;
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

export default IsometricPremises;
