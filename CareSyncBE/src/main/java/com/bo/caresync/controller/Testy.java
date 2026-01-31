package com.bo.caresync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 2:45 PM,
 **/

@RestController
public class Testy extends BaseController{
    @GetMapping("/hello")
    public ResponseEntity<?> helloWorld(){
        return successResponse("Hello World","Hello World");
    }
}
