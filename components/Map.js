import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 房子数据（含图片和链接）
const houseList = [
  {
    id: 1,
    name: 'Eco Park',
    lat: 3.100,
    lng: 101.600,
    price: 320000,
    img: 'https://placehold.co/300x150?text=Eco+Park',
    link: 'https://example.com/property/eco'
  },
  {
    id: 2,
    name: 'Bukit Indah',
    lat: 3.150,
    lng: 101.650,
    price: 500000,
    img: 'https://placehold.co/300x150?text=Bukit+Indah',
    link: 'https://example.com/property/bukit-indah'
  },
  {
    id: 3,
    name: 'Taman Desa',
    lat: 3.120,
    lng: 101.620,
    price: 750000,
    img: 'https://placehold.co/300x150?text=Taman+Desa',
    link: 'https://example.com/property/taman-desa'
  }
];

// 计算距离
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 地图定位
function FlyTo({ lat, lng }) {
  const map = useMap();
  map.flyTo([lat, lng], 13);
  return null;
}

export default function Map() {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState(10);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [center, setCenter] = useState({ lat: 3.12, lng: 101.62 });
  const [lang, setLang] = useState('en'); // 当前语言

  const t = {
    en: {
      searchPlaceholder: 'Enter location (e.g. Kuala Lumpur)',
      locate: 'Locate',
      distance: 'Distance (km)',
      price: 'Price',
      more: 'View more',
      langSwitch: 'Switch to 中文'
    },
    zh: {
      searchPlaceholder: '请输入地点（如 吉隆坡）',
      locate: '定位',
      distance: '距离 (公里)',
      price: '价格',
      more: '查看更多',
      langSwitch: '切换 English'
    }
  };

  const filtered = houseList.filter((house) => {
    const distance = getDistance(center.lat, center.lng, house.lat, house.lng);
    return (
      house.name.toLowerCase().includes(search.toLowerCase()) &&
      distance <= range &&
      house.price >= minPrice &&
      house.price <= maxPrice
    );
  });

  const handleLocationSearch = async () => {
    if (!search) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${search}`);
    const data = await res.json();
    if (data[0]) {
      setCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } else {
      alert(lang === 'zh' ? '找不到这个地点' : 'Location not found');
    }
  };

  return (
    <div>
      {/* 顶部语言切换 */}
      <div style={{ textAlign: 'right', padding: '10px 20px' }}>
        <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
          🌐 {t[lang].langSwitch}
        </button>
      </div>

      {/* 搜索栏和筛选 */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder={`🔍 ${t[lang].searchPlaceholder}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '60%', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }}
        />
        <button onClick={handleLocationSearch} style={{ padding: '10px 15px', marginLeft: '10px' }}>
          {t[lang].locate}
        </button>
        <div style={{ marginTop: '10px' }}>
          📍 {t[lang].distance}:
          <input type="number" value={range} onChange={(e) => setRange(Number(e.target.value))} style={{ width: '60px', margin: '0 10px' }} />
          💰 {t[lang].price}: 
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
            <Popup maxWidth={300}>
              <div style={{ textAlign: 'center' }}>
                <img src={house.img} alt={house.name} style={{ width: '100%', borderRadius: '6px', marginBottom: '5px' }} />
                <strong>{house.name}</strong><br />
                RM{house.price.toLocaleString()}<br />
                <a href={house.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '5px', color: 'blue' }}>
                  🔗 {t[lang].more}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
