package com.ferramenta.magazzino.advice;

public class AlreadyExistsException extends RuntimeException{

    public AlreadyExistsException(String message){
        super(message);
    }
}
