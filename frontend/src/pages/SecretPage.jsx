/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import companiesData from "../utils/companies.json";
import peopleData from "../utils/people.json";
import {
  Search,
  Building2,
  Users,
  TrendingUp,
  MapPin,
  X,
  ArrowUpDown,
  Trophy,
  Briefcase,
  Gem
} from "lucide-react";

const SecretPage = () => {
  const [companies, setCompanies] = useState([]);
  const [people, setPeople] = useState([]);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const admins = import.meta.env.VITE_ADMIN?.split(",");
  const navigate = useNavigate();

  // View State
  const [view, setView] = useState("companies"); // 'companies' | 'students'

  // Company Section Filters
  const [compSearch, setCompSearch] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compSort, setCompSort] = useState("default");

  // People Section Filters
  const [pplSearch, setPplSearch] = useState("");
  const [pplCompany, setPplCompany] = useState("");
  const [pplSort, setPplSort] = useState("default");

  const verify = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data.user);
    } catch {
      localStorage.removeItem("token");
      toast.error("Session expired");
      navigate("/login");
    }
  };

  const fetchData = async () => {
    try {
      setCompanies(companiesData);
      setPeople(peopleData);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();
  }, []);

  useEffect(() => {
    if (!userData) return;
    // if (!admins.includes(userData.email)) {
    //   toast.error("Why Vro!");
    //   navigate("/");
    //   return;
    // }
    
    fetchData();
  }, [userData]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const packages = people.map((p) => parseFloat(p.Package) || 0);
    const sorted = [...packages].sort((a, b) => a - b);

    const total = people.length;
    const totalCompanies = companies.length;
    const lowest = sorted[0] || 0;
    const highest = sorted[sorted.length - 1] || 0;
    const average = total ? (packages.reduce((a, b) => a + b, 0) / total) : 0;
    const median = sorted[Math.floor(sorted.length / 2)] || 0;

    return {
      totalPlaced: total,
      totalCompanies,
      lowest,
      highest,
      average: average.toFixed(2),
      median: median.toFixed(2),
    };
  }, [people, companies]);

  // Derived Lists for Dropdowns
  const uniqueCities = useMemo(() => {
    const citySet = new Set(companies.map((c) => c.Location).filter(Boolean));
    return Array.from(citySet).sort();
  }, [companies]);

  const uniquePeopleCompanies = useMemo(() => {
    const names = new Set();
    people.forEach(p => {
      if (p.Name) {
        p.Name.split(',').forEach(n => names.add(n.trim()));
      }
    });
    return Array.from(names).sort();
  }, [people]);

  // Filtering Logic: Companies
  const filteredCompanies = useMemo(() => {
    let result = companies.filter((company) => {
      const matchesSearch = company.Name.toLowerCase().includes(compSearch.toLowerCase());
      const matchesCity = !compCity || company.Location === compCity;
      return matchesSearch && matchesCity;
    });

    if (compSort === "highToLow") {
      result.sort((a, b) => (parseFloat(b.Package) || 0) - (parseFloat(a.Package) || 0));
    } else if (compSort === "lowToHigh") {
      result.sort((a, b) => (parseFloat(a.Package) || 0) - (parseFloat(b.Package) || 0));
    } else if (compSort === "name") {
      result.sort((a, b) => a.Name.localeCompare(b.Name));
    }

    return result;
  }, [companies, compSearch, compCity, compSort]);

  // Filtering Logic: People
  const filteredPeople = useMemo(() => {
    let result = people.filter((person) => {
      const searchLower = pplSearch.toLowerCase();
      const matchesSearch =
        person.name.toLowerCase().includes(searchLower) ||
        person.Name.toLowerCase().includes(searchLower) ||
        (person.ID && person.ID.toLowerCase().includes(searchLower));

      const matchesCompany = !pplCompany || person.Name.includes(pplCompany);

      return matchesSearch && matchesCompany;
    });

    if (pplSort === "highToLow") {
      result.sort((a, b) => (parseFloat(b.Package) || 0) - (parseFloat(a.Package) || 0));
    } else if (pplSort === "lowToHigh") {
      result.sort((a, b) => (parseFloat(a.Package) || 0) - (parseFloat(b.Package) || 0));
    }

    return result;
  }, [people, pplSearch, pplCompany, pplSort]);

  // Helper to check for Jackpot/Loot
  const getBadgeType = (companyName) => {
    if (!companyName) return null;
    const lowerName = companyName.toLowerCase();

    if (lowerName.includes('covasant')) return 'loot';
    if (companyName.includes(',') || companyName.includes('&')) return 'jackpot';
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 animate-pulse font-medium">Loading Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50/30">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Statistics Header */}
        <div className="space-y-6">
          <div className="flex justify-center">

            {/* View Toggle Buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setView('companies')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${view === 'companies'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Building2 size={16} />
                Companies
              </button>
              <button
                onClick={() => setView('students')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${view === 'students'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Users size={16} />
                Students
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Placed", value: stats.totalPlaced, icon: Users, color: "blue" },
              { label: "Companies", value: stats.totalCompanies, icon: Building2, color: "purple" },
              { label: "Highest", value: `${stats.highest} LPA`, icon: TrendingUp, color: "green" },
              { label: "Average", value: `${stats.average} LPA`, icon: TrendingUp, color: "yellow" },
              { label: "Median", value: `${stats.median} LPA`, icon: TrendingUp, color: "orange" },
              { label: "Lowest", value: `${stats.lowest} LPA`, icon: TrendingUp, color: "red" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                style={{
                  animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-50 mb-3`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COMPANIES SECTION */}
        {view === 'companies' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
                <span className="text-sm text-gray-500">
                  {filteredCompanies.length} of {companies.length}
                </span>
              </div>

              {/* Company Filters */}
              <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="relative w-full md:w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={compCity}
                    onChange={(e) => setCompCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full md:w-48">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={compSort}
                    onChange={(e) => setCompSort(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="default">Default Sort</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="highToLow">Pkg: High to Low</option>
                    <option value="lowToHigh">Pkg: Low to High</option>
                  </select>
                </div>

                {(compSearch || compCity || compSort !== 'default') && (
                  <button
                    onClick={() => { setCompSearch(""); setCompCity(""); setCompSort("default"); }}
                    className="p-2.5 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Companies Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, idx) => (
                <div
                  key={company.Name}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {company.Name}
                    </h3>
                    <div className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100">
                      {company.Count} placed
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Package</span>
                      <span className="font-semibold text-blue-600">{company.Package} LPA</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Stipend</span>
                      <span className="font-semibold">{company.Stipend || "0"}K/month</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Location</span>
                      <span className="font-semibold">{company.Location}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-500">Bond</span>
                      <span className="font-semibold">{company.Bond || "0"} Year</span>
                    </div>
                  </div>

                  {company.Bros && company.Bros.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-3 font-semibold">Bros</p>
                      <div className="flex flex-wrap gap-3">
                        {/* Displaying ALL students without slice */}
                        {company.Bros.map((bro) => (
                          <div
                            key={bro.ID}
                            className="group/avatar relative"
                          >
                            <img
                              src={bro.image}
                              alt={bro.name}
                              className="w-20 h-20 rounded-full object-cover ring-2 ring-white group-hover/avatar:ring-blue-400 transition-all transform group-hover/avatar:scale-110"
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {bro.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No companies found matching your filters</p>
              </div>
            )}
          </section>
        )}

        {/* PEOPLE SECTION */}
        {view === 'students' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">Bros</h2>
                <span className="text-sm text-gray-500">
                  {filteredPeople.length} of {people.length}
                </span>
              </div>

              {/* People Filters */}
              <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={pplSearch}
                    onChange={(e) => setPplSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="relative w-full md:w-48">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={pplCompany}
                    onChange={(e) => setPplCompany(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none cursor-pointer"
                  >
                    <option value="">All Companies</option>
                    {uniquePeopleCompanies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full md:w-48">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={pplSort}
                    onChange={(e) => setPplSort(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none cursor-pointer"
                  >
                    <option value="default">Sort by ID</option>
                    <option value="highToLow">LPA: High to Low</option>
                    <option value="lowToHigh">LPA: Low to High</option>
                  </select>
                </div>

                {(pplSearch || pplCompany || pplSort !== 'default') && (
                  <button
                    onClick={() => { setPplSearch(""); setPplCompany(""); setPplSort("default"); }}
                    className="p-2.5 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* People Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPeople.map((person, idx) => {
                const badgeType = getBadgeType(person.Name);

                return (
                  <div
                    key={person.ID}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
                    style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.02}s both` }}
                  >
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="relative mb-4">
                        {/* Gray Badge Display */}
                        {badgeType === 'jackpot' && (
                          <div className="absolute -top-2 -left-3 z-20 bg-gray-100 border border-gray-50 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <Trophy size={10} className="text-gray-500" /> Jackpot 🎰
                          </div>
                        )}
                        {badgeType === 'loot' && (
                          <div className="absolute -top-2 -left-3 z-20 bg-gray-100 border border-gray-50 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <Gem size={10} className="text-gray-500" /> Loot 💰
                          </div>
                        )}

                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-blue-400 transition-all"
                        />
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                        {person.name}
                      </h3>

                      <p className="text-sm text-gray-500 mb-4">ID: {person.ID}</p>

                      <div className="w-full space-y-2 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">Company</span>
                          <span className="font-semibold text-gray-800 text-right truncate max-w-[120px]">
                            {person.Name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">Package</span>
                          <span className="font-semibold text-green-600">
                            {person.Package} LPA
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-500">Location</span>
                          <span className="font-semibold text-gray-800">{person.Location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPeople.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No students found matching your filters</p>
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SecretPage;