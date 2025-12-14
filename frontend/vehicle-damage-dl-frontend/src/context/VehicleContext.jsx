//using firebase google auth features
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { createContext, useState, useEffect } from "react";
import { useContext } from "react";

//creating a instance of the feature

const getGoogleProvider=()=>{
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({prompt: "select_account"});
  return provider
}

//creating the context

const VehicleContext=createContext()

export const VehicleProvider=({children})=>{
  //for storing/geting the user local storage
  const [user,setUser]=useState(()=>{
    try{
      return JSON.parse(localStorage.getItem("user")) || null
    }catch(error){
      return null;
    }
  })

  //function to track the changes of the user
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth, (u) => {
      console.log(u)
      if (u) {
        const uobj={
        uid:u.uid,
        name:u.displayName,
        email:u.email,
        photo:u.photoURL
      }
      //updating the state variable with user info
      setUser(uobj)
      //storing the logged user information into local storage
      localStorage.setItem("user",JSON.stringify(uobj))
      } else {
        //user is signed out
        setUser(null)
        localStorage.removeItem("user")
      }
    });
    return unsub;
  },[])


  //function to handle google login
  const loginWithGoogle=async()=>{
    try {
      let provider=getGoogleProvider()
      let res=await signInWithPopup(auth, provider)
      const u=res.user;
      console.log("userinfo:",u)
      const uobj={
        uid:u.uid,
        name:u.displayName,
        email:u.email,
        photo:u.photoURL
      }
      //updating the state variable with user info
      setUser(uobj)
      //storing the logged user information into local storage
      localStorage.setItem("user",JSON.stringify(uobj))
      return uobj
    } catch (error) {
      console.log("failed to login",error)
      return error
    }
  }

  //function to logout
  const logout=async()=>{
    try {
      await signOut(auth)
      setUser(null)
      localStorage.removeItem("user")
    } catch (error) {
      alert("error in logout")
    }
  }

  return(
    <VehicleContext.Provider value={{user,setUser,loginWithGoogle,logout}}>
      {children}
    </VehicleContext.Provider>
  )

};

//custom hook:- reusable logit we can reuse as many number of times
const useVehicle=()=>useContext(VehicleContext)
export default useVehicle