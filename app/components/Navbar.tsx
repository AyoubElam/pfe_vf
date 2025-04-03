"use client"
import { useState, useEffect, type SetStateAction } from "react"
import { Badge, IconButton, Tooltip, Menu, MenuItem } from "@mui/material"
import { Notifications as NotificationsIcon, AccountCircle, Mail as MailIcon } from "@mui/icons-material"
import { ModeToggle } from "./mode-toggle" // Import the theme toggle
import { useTheme } from "next-themes"

const Navbar = () => {
  const [notifCount, setNotifCount] = useState(0)
  const [msgCount, setMsgCount] = useState(0)
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null)
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null)
  const [anchorElMessages, setAnchorElMessages] = useState<null | HTMLElement>(null)
  const { theme } = useTheme()

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau projet assigné", description: "Vous avez été assigné au projet X.", date: "2025-02-13" },
    { id: 2, title: "Mise à jour de statut", description: "Le projet Y a été validé.", date: "2025-02-12" },
    {
      id: 3,
      title: "Date limite approchante",
      description: "La date limite de soumission pour le rapport est le 20 février.",
      date: "2025-02-10",
    },
  ])

  const [messages, setMessages] = useState([
    { id: 1, from: "Prof. Ahmed", text: "Merci pour votre rapport" },
    { id: 2, from: "Admin", text: "Votre compte a été mis à jour" },
  ])

  useEffect(() => {
    setNotifCount(notifications.length)
    setMsgCount(messages.length)
  }, [notifications, messages])

  const handleClickNotif = (event: { currentTarget: SetStateAction<null> }) => setAnchorElNotif(event.currentTarget)
  const handleCloseNotif = () => setAnchorElNotif(null)

  const handleClickProfile = (event: { currentTarget: SetStateAction<null> }) => setAnchorElProfile(event.currentTarget)
  const handleCloseProfile = () => setAnchorElProfile(null)

  const handleClickMessages = (event: { currentTarget: SetStateAction<null> }) =>
    setAnchorElMessages(event.currentTarget)
  const handleCloseMessages = () => setAnchorElMessages(null)

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md transition-all duration-300">
      <h1 className="text-xl font-bold text-gray-800">Gestion PFE</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleClickNotif}
              className="hover:bg-[#D2B48C] transition-colors duration-300"
            >
              <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon className="text-gray-600 dark:text-gray-300 cursor-pointer text-xl transition-colors" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElNotif}
            open={Boolean(anchorElNotif)}
            onClose={handleCloseNotif}
            PaperProps={{
              style: {
                maxHeight: 300,
                width: "300px",
              },
            }}
          >
            <div className="px-4 py-2 bg-gray-100">
              <h3 className="font-bold text-gray-800">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <MenuItem>Aucune notification</MenuItem>
            ) : (
              notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={handleCloseNotif} className="hover:bg-[#D2B48C]">
                  <div className="py-1">
                    <div className="font-semibold">{notif.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{notif.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{notif.date}</div>
                  </div>
                </MenuItem>
              ))
            )}
          </Menu>
        </div>

        {/* Messages */}
        <div className="relative">
          <Tooltip title="Messages">
            <IconButton
              color="inherit"
              onClick={handleClickMessages}
              className="hover:bg-[#D2B48C] transition-colors duration-300"
            >
              <Badge badgeContent={msgCount} color="primary">
                <MailIcon className="text-gray-600 dark:text-gray-300 cursor-pointer text-xl transition-colors" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorElMessages}
            open={Boolean(anchorElMessages)}
            onClose={handleCloseMessages}
            PaperProps={{
              style: {
                maxHeight: 300,
                width: "250px",
              },
            }}
          >
            <div className="px-4 py-2 bg-gray-100">
              <h3 className="font-bold text-gray-800">Messages</h3>
            </div>
            {messages.length === 0 ? (
              <MenuItem>Aucun message</MenuItem>
            ) : (
              messages.map((msg) => (
                <MenuItem key={msg.id} onClick={handleCloseMessages} className="hover:bg-[#D2B48C]">
                  <div>
                    <div className="font-semibold">{msg.from}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{msg.text}</div>
                  </div>
                </MenuItem>
              ))
            )}
          </Menu>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <Tooltip title="Compte">
            <IconButton
              onClick={handleClickProfile}
              color="inherit"
              className="hover:bg-[#D2B48C] transition-colors duration-300"
            >
              <AccountCircle className="text-gray-600 dark:text-gray-300 cursor-pointer text-2xl transition-colors" />
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorElProfile} open={Boolean(anchorElProfile)} onClose={handleCloseProfile}>
            <MenuItem onClick={handleCloseProfile} className="hover:bg-[#D2B48C]">
              Mon Profil
            </MenuItem>
            <MenuItem onClick={handleCloseProfile} className="hover:bg-[#D2B48C]">
              Paramètres
            </MenuItem>
            <MenuItem onClick={handleCloseProfile} className="hover:bg-[#D2B48C]">
              Déconnexion
            </MenuItem>
          </Menu>
        </div>

        {/* Theme Toggle Button */}
        <ModeToggle />
      </div>
    </div>
  )
}

export default Navbar

