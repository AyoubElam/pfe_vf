"use client";
import Link from "next/link";
import { useState, useEffect, SetStateAction } from "react";
import { Badge, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { Notifications as NotificationsIcon, AccountCircle, Mail as MailIcon } from "@mui/icons-material";
import { ModeToggle } from "./mode-toggle"; // Import the theme toggle

const Navbar = () => {
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const [anchorElMessages, setAnchorElMessages] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau projet assigné", description: "Vous avez été assigné au projet X.", date: "2025-02-13" },
    { id: 2, title: "Mise à jour de statut", description: "Le projet Y a été validé.", date: "2025-02-12" },
    { id: 3, title: "Date limite approchante", description: "La date limite de soumission pour le rapport est le 20 février.", date: "2025-02-10" },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, from: "Prof. Ahmed", text: "Merci pour votre rapport" },
    { id: 2, from: "Admin", text: "Votre compte a été mis à jour" },
  ]);

  useEffect(() => {
    setNotifCount(3); // Example to set the notification count
    setMsgCount(messages.length); // Update message count
  }, [messages]);

  const handleClickNotif = (event: { currentTarget: SetStateAction<null> }) => setAnchorElNotif(event.currentTarget);
  const handleCloseNotif = () => setAnchorElNotif(null);

  const handleClickProfile = (event: { currentTarget: SetStateAction<null> }) => setAnchorElProfile(event.currentTarget);
  const handleCloseProfile = () => setAnchorElProfile(null);

  const handleClickMessages = (event: { currentTarget: SetStateAction<null> }) => setAnchorElMessages(event.currentTarget);
  const handleCloseMessages = () => setAnchorElMessages(null);

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-lg font-bold">My Application</h1>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleClickNotif}>
              <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon className="text-gray-600 cursor-pointer text-xl hover:text-blue-500 transition" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorElNotif} open={Boolean(anchorElNotif)} onClose={handleCloseNotif}>
            {notifications.length === 0 ? (
              <MenuItem>Aucune notification</MenuItem>
            ) : (
              notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={handleCloseNotif}>
                  <strong>{notif.title}</strong> <br />
                  {notif.description} <br />
                  <small>{notif.date}</small>
                </MenuItem>
              ))
            )}
          </Menu>
        </div>

        {/* Messages */}
        <div className="relative">
          <Tooltip title="Messages">
            <IconButton color="inherit" onClick={handleClickMessages}>
              <Badge badgeContent={msgCount} color="primary">
                <MailIcon className="text-gray-600 cursor-pointer text-xl hover:text-blue-500 transition" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorElMessages} open={Boolean(anchorElMessages)} onClose={handleCloseMessages}>
            {messages.length === 0 ? (
              <MenuItem>Aucun message</MenuItem>
            ) : (
              messages.map((msg) => (
                <MenuItem key={msg.id} onClick={handleCloseMessages}>
                  <strong>{msg.from}:</strong> {msg.text}
                </MenuItem>
              ))
            )}
          </Menu>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <Tooltip title="Compte">
            <IconButton onClick={handleClickProfile} color="inherit">
              <AccountCircle className="text-gray-600 cursor-pointer text-2xl hover:text-blue-500 transition" />
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorElProfile} open={Boolean(anchorElProfile)} onClose={handleCloseProfile}>
            <MenuItem onClick={handleCloseProfile}>Mon Profil</MenuItem>
            <MenuItem onClick={handleCloseProfile}>Paramètres</MenuItem>
            <MenuItem onClick={handleCloseProfile}>Déconnexion</MenuItem>
          </Menu>
        </div>

        {/* Add the ModeToggle Button */}
        <ModeToggle />  {/* Theme toggle button */}
      </div>
    </div>
  );
};

export default Navbar;
