import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, ChevronRight } from "react-feather";

const Footer = ({ darkMode }) => {
  const links = [
    { name: "About", href: "#about" },
    { name: "Resources", href: "#resources" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms", href: "#" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mt-20 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <motion.h3
              whileHover={{ x: 5 }}
              className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              MindMate
            </motion.h3>
            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
              Your mental wellness companion for a healthier mind and happier
              life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href={link.href}
                    className={`flex items-center ${
                      darkMode
                        ? "text-gray-300 hover:text-blue-400"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    <ChevronRight size={14} className="mr-1" />
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail
                  size={16}
                  className={`mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <a
                  href="mailto:info@mindmate.ai"
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  info@mindmate.ai
                </a>
              </li>
              <li className="flex items-center">
                <Phone
                  size={16}
                  className={`mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  051-1122334
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Subscribe to our newsletter for mental health tips and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className={`flex-grow px-4 py-2 rounded-l-lg focus:outline-none ${
                  darkMode
                    ? "bg-gray-700 text-white placeholder-gray-400"
                    : "bg-white text-gray-900 placeholder-gray-500"
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-r-lg ${
                  darkMode ? "bg-blue-600" : "bg-blue-500"
                } text-white`}
              >
                Join
              </motion.button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`border-t mt-12 pt-6 text-center ${
            darkMode
              ? "border-gray-700 text-gray-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          <p>© 2025 MindMate. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
