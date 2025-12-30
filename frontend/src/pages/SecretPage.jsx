/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import companiesData from "../utils/companies.json";
import peopleData from "../utils/people.json";
import { Search, Building2, Users, TrendingUp, MapPin, Filter, X } from "lucide-react";

const SecretPage = () => {
  const [companies, setCompanies] = useState([]);
  const [people, setPeople] = useState([]);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const admins = import.meta.env.VITE_ADMIN?.split(",");
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [showFilters, setShowFilters] = useState(true);

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

    if (!admins.includes(userData.email)) {
      toast.error("Why vro?");
      navigate("/");
      return;
    }

    fetchData();
  }, [userData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const packages = people.map((p) => parseFloat(p.Package) || 0);
    const sorted = [...packages].sort((a, b) => a - b);
    
    const total = people.length;
    const totalCompanies = companies.length;
    const lowest = sorted[0] || 0;
    const highest = sorted[sorted.length - 1] || 0;
    const average = packages.reduce((a, b) => a + b, 0) / total || 0;
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

  // Get unique cities and company names
  const cities = useMemo(() => {
    const citySet = new Set(people.map((p) => p.Location).filter(Boolean));
    return Array.from(citySet).sort();
  }, [people]);

  const companyNames = useMemo(() => {
    const names = companies.map((c) => c.Name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [companies]);

  // Filtered data
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.Name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = !selectedCity || company.Location === selectedCity;
      const matchesCompany = !selectedCompany || company.Name === selectedCompany;
      return matchesSearch && matchesCity && matchesCompany;
    });
  }, [companies, searchQuery, selectedCity, selectedCompany]);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesSearch =
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.Name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = !selectedCity || person.Location === selectedCity;
      const matchesCompany = !selectedCompany || person.Name === selectedCompany;
      return matchesSearch && matchesCity && matchesCompany;
    });
  }, [people, searchQuery, selectedCity, selectedCompany]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCompany("");
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedCompany;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 animate-pulse">Loading placement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Statistics Cards */}
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

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          <div
            className={`grid md:grid-cols-3 gap-4 transition-all duration-300 ${
              showFilters ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* City Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">All Companies</option>
                {companyNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Companies Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
            <span className="text-sm text-gray-500">
              {filteredCompanies.length} of {companies.length}
            </span>
          </div>

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
                  <div className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
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
                    <p className="text-xs text-gray-500 mb-3 font-semibold">Placed Students</p>
                    <div className="flex flex-wrap gap-3">
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
            <div className="text-center py-12 bg-white rounded-2xl">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No companies found matching your filters</p>
            </div>
          )}
        </section>

        {/* People Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Placed Students</h2>
            <span className="text-sm text-gray-500">
              {filteredPeople.length} of {people.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person, idx) => (
              <div
                key={person.ID}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.02}s both`,
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-blue-400 transition-all mb-4"
                  />
                  
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                    {person.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-4">ID: {person.ID}</p>
                  
                  <div className="w-full space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Company</span>
                      <span className="font-semibold text-gray-800">{person.Name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Package</span>
                      <span className="font-semibold text-green-600">{person.Package} LPA</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-500">Location</span>
                      <span className="font-semibold text-gray-800">{person.Location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPeople.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students found matching your filters</p>
            </div>
          )}
        </section>
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
      `}</style>
    </div>
  );
};

export default SecretPage;