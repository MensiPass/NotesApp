import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "./../../utils/helper";
import moment from "moment";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNoteImg from "../../assets/imags/add-notes.svg";
import NoDataImg from "../../assets/imags/no-data.svg";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [isSearch, setIsSearch] = useState(false);

  const [userInfo, setUserInfo] = useState("");
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEdit = (noteDetails: any) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message: string, type: string) => {
    setShowToastMsg({ isShown: true, message, type });
  };
  const handleCloseToast = () => {
    setShowToastMsg({ isShown: false, message: "", type: "add" });
  };
  //get user info

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user.fullName);
      }
    } catch (error: any) {
      if (error.response.status == 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  //get all notes for user
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.");
    }
  };
  //delete Note
  const deleteNote = async (data: any) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfuly.", "delete");
        getAllNotes();
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occured. Please try again.");
      }
    }
  };

  //sarch for a note
  const onSearchNote = async (query: any) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateIsPinned = async (noteData: any) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/update-note-pinned" + noteId, {
        isPinned: !noteData.isPinned,
      });
      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfuly.", "edit");
        getAllNotes();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item, index) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={moment(item.createdOn).format("Do MMM YYYY")}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => {
                  deleteNote(item);
                }}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? NoDataImg : AddNoteImg}
            message={
              isSearch
                ? "No notes found matching your search."
                : "Start creating your first noe! Click the 'Add' button to start."
            }
          />
        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgb(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={() => showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={() => handleCloseToast()}
      />
    </>
  );
};
export default Home;
