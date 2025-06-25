import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修复图标
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 房子资料
const houseList = [
  { id: 1, name: 'Eco Park', lat: 3.100, lng: 101.600, price: 320000 },
  { id: 2, name: 'Bukit Indah', lat: 3.150, lng: 101.650, price: 500000 },
  { id: 3, name: 'Taman Desa', lat: 3.120, lng: 101.620, price: 750000 }
];

// 计算两点之间距离（单位：公里）
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // 地球半径
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 自动移动地图到新中心点
function FlyTo({ lat, lng }) {
  const map = useMap();
  map.flyTo([lat, lng], 13);
  return null;
}

export default function Map() {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState(10); // 公里
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [center, setCenter] = useState({ lat: 3.12, lng: 101.62 });

  // 过滤房子（根据搜索、距离、价格）
  const filtered = houseList.filter((house) => {
    const distance = getDistance(center.lat, center.lng, house.lat, house.lng);
    return (
      house.name.toLowerCase().includes(search.toLowerCase()) &&
      distance <= range &&
      house.price >= minPrice &&
      house.price <= maxPrice
    );
  });

  // 根据用户输入地址查询经纬度
  const handleLocationSearch = async () => {
    if (!search) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${search}`);
    const data = await res.json();
    if (data[0]) {
      setCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } else {
      alert('找不到这个地点');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="🔍 输入地点（如 Kuala Lumpur）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '60%', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }}
        />
        <button onClick={handleLocationSearch} style={{ padding: '10px 15px', marginLeft: '10px' }}>定位</button>
        <div style={{ marginTop: '10px' }}>
          📍 距离 (km):
          <input type="number" value={range} onChange={(e) => setRange(Number(e.target.value))} style={{ width: '60px', margin: '0 10px' }} />
          💰 价格: 
          RM <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} style={{ width: '80px', margin: '0 5px' }} />
          - RM <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: '80px', margin: '0 5px' }} />
        </div>
      </div>

      <MapContainer center={[center.lat, center.lng]} zoom={12} scrollWheelZoom={true} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo lat={center.lat} lng={center.lng} />
        {filtered.map((house) => (
          <Marker key={house.id} position={[house.lat, house.lng]}>
            <Popup>
              <strong>{house.name}</strong><br />
              RM{house.price.toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
